import { workout } from "./gym"
import { getAllWantedAugmentationsFromOwnFactions, enoughRep, getGoals, getInstitutions, getOptions, writeFile, keepFocus, isCriming, getWantedAugmentationsFromFaction } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	// ns.disableLog("ALL")
	// if (keepFocus(ns) || isCriming(ns)) return
	await buildTable(ns)
	// ns.run("runin.js", 1, 1, "singularity.js")
}

async function buildTable(ns) {
	const options = getOptions(ns)
	await ns.scp("required_stats.script", options.host, "home")
	const statsGoal = getGoals(ns)
	const institutions = getInstitutions(ns)

	const table = { "tasks": [] }
	const t = Date.now()
	let last = t
	ns.print("start: " + (Date.now() - t))
	for (let task of allTasks(ns, institutions)) {
		task.value = await taskValue(ns, options, institutions, statsGoal, task)
		table["tasks"].push(task)
		const d = Date.now()
		if (d - last > 20)
			ns.print("big: " + (d - last) + " task: " + task.type)
		last = d
	}
	ns.print("end: " + (Date.now() - t))
	await writeFile(ns, "tasks.txt", table)
}

function allTasks(ns, institutions) {
	const jobs = ["IT", "software", "security", "business"]
	const factionWork = ["Hacking Contracts", "security work", "field work"]
	const crimes = ["shoplift", "rob store", "mug someone", "larceny", "deal drugs",
		"bond forgery", "trafficking illegal arms", "homicide", "grand theft auto",
		"kidnap and ransom", "assassinate", "heist"]
	const workoutStats = ["strength", "defense", "dexterity", "agility", "charisma"]
	let tasks = []
	// for (const stat of workoutStats) {
	// 	tasks.push({ "type": "train", "subType": stat })
	// }
	// for (const crime of crimes) {
	// 	tasks.push({ "type": "crime", "subType": crime })
	// }
	for (const faction of [ns.getPlayer().factions[0]]) {
		for (const work of factionWork) {
			tasks.push({ "type": "faction", "at": faction, "subType": work })
		}
	}
	// for (const company in institutions.corporations) {
	// 	for (const job of jobs) {
	// 		tasks.push({ "type": "work", "at": company, "subType": job })
	// 	}
	// }
	return tasks
}

function isOwnFaction(ns, corp) {
	for (const faction of ns.getPlayer().factions) {
		if (faction == corp) return true
		if (faction.includes("ulcrum") && corp.includes("ulcrum")) return true
	}
	return false
}

/** @param {import(".").NS} ns **/
async function taskValue(ns, options, institutions, statsGoal, task) {
	if (task.type == "train" && ns.getPlayer().money < 5e6) return 0
	const workoutFile = "workout_gain_" + task.subType + ".txt"
	if (task.type == "crime") return crimeBenefit(ns, options, statsGoal, task.subType)
	if (task.type == "work" && isOwnFaction(ns, task.at)) return 0

	let statsGain
	if (task.type == "train" && ns.fileExists(workoutFile))
		statsGain = parseFile(ns, workoutFile)
	else {
		statsGain = measure(ns, options, institutions, task)
		if (task.type == "train")
			await saveFile(ns, workoutFile, statsGain)
	}

	const p = ns.getPlayer()
	const stats = ["agility", "dexterity", "strength", "defense", "charisma", "hacking"]
	let value = 0
	for (const stat of stats) {
		value += statsGain[stat] * statsGoal[stat] / p.skills[stat] * options[stat + "_weight"]
		// Print everey variable of the above line
		ns.tprint("stat: " + stat + " value: " + value + " gain: " + statsGain[stat] + " goal: " + statsGoal[stat] + " skill: " + p.skills[stat] + " weight: " + options[stat + "_weight"])
	}
	value += statsGain["money"] * statsGoal["money"] / p["money"] * options["money_weight"]
	ns.tprint("value: " + value)
	if (["work", "faction"].includes(task.type)) {
		task.time = reputationTime(ns, options, statsGain.rep, task)
		value += options.repDefaultTime / task.time
		if (task.type === "work") {
			value *= 0.5
		}
		if (task.at.includes("lack")) {
			value = 0
		}
	}
	return value
}

function parseFile(ns, file) {
	return JSON.parse(ns.read(file))
}

async function saveFile(ns, file, data) {
	await ns.write(file, JSON.stringify(data, null, 2), "w")
}

function reputationTime(ns, options, repGain, task) {
	if (task.type == "work") {
		const rep = requiredReputation(task.at)
		return (rep - ns.singularity.getCompanyRep(task.at)) / repGain
	}
	if (task.type == "faction") {
		return getFastestAugmentationTime(ns, task.at, repGain)
	}
	return Infinity
}

function reputationBenefit(ns, options, repGain, task) {
	const time = reputationTime(ns, options, repGain, task)
	return options.repDefaultTime / time
}

function getFastestAugmentationTime(ns, faction, repGain) {
	const enoughRepAugs = getAllWantedAugmentationsFromOwnFactions(ns).filter(a => enoughRep(ns, a[0], a[1])).map(a => a[0])
	const notPurchasable = aug => !enoughRepAugs.includes(aug)
	const factionRep = ns.singularity.getFactionRep(faction)
	const missingRepTime = aug => (ns.singularity.getAugmentationRepReq(aug) - factionRep) / repGain
	const isLessRep = (a, b) => missingRepTime(a) - missingRepTime(b)
	const notEnoughRep = aug => ns.singularity.getAugmentationRepReq(aug) > factionRep
	const isOwnedAugmentations = aug => !ns.singularity.getOwnedAugmentations(true).includes(aug)

	const augmentations = getWantedAugmentationsFromFaction(ns, faction)
		.filter(isOwnedAugmentations)
		.filter(notEnoughRep)
		.filter(notPurchasable)
		.sort(isLessRep)

	if (augmentations.length > 0) {
		return missingRepTime(augmentations[0])
	}
	return Infinity
}

function notNeuroFlux(aug) {
	return aug != "NeuroFlux Governor"
}

function requiredReputation(company) {
	if (company.includes("ulcrum")) {
		return 250e3
	}
	return 200e3
}

function measure(ns, options, institutions, task) {
	ns.singularity.stopAction()
	performAction(ns, options, institutions, task)
	const rate = getStats(ns)
	ns.singularity.stopAction()
	return rate
}

function getStats(ns) {
	const factor = 5
	const stats = ["agility", "dexterity", "strength", "defense", "charisma"]
	const p = ns.getPlayer()
	let rate = {}
	for (const stat of stats) {
		rate[stat] = factor * p["work" + stat[0].toUpperCase() + stat[1] + stat[2] + "ExpGainRate"]
	}
	rate.hacking = factor * p.workHackExpGainRate
	rate.rep = factor * p.workRepGainRate
	rate.money = factor * (p.workMoneyGainRate - p.workMoneyLossRate)
	return rate
}

export function performAction(ns, options, institutions, task) {
	if (task.type == "work") {
		const city = institutions.corporations[task.at][1]
		if (ns.getPlayer().city != city) {
			if (ns.getPlayer().money > 50e6) {
				ns.singularity.travelToCity(city)
			} else {
				return false
			}
		}
		ns.singularity.applyToCompany(task.at, task.subType)
		ns.singularity.workForCompany(task.at, task.subType)
	}
	if (task.type == "faction") {
		ns.singularity.workForFaction(task.at, task.subType) // TODO takes ~:150ms realtime
	}
	if (task.type == "crime") return ns.commitCrime(task.subType)
	if (task.type == "train") return workout(ns, task.subType)
	return task.value > options.taskValueThreshold
}

export function crimeBenefit(ns, options, requiredStats, crime) {
	let crimeSum = 0
	const crimeStats = ns.singularity.getCrimeStats(crime)
	const stats = ["agility", "dexterity", "strength", "defense", "charisma", "hacking"]
	for (const stat of stats) {
		crimeSum += crimeStats[stat + "_exp"] * (1 + ns.singularity.getCrimeChance(crime) * crimeStats[stat + "_success_weight"]) * options[stat + "_weight"] * requiredStats[stat] / ns.getPlayer().skills[stat]
	}
	crimeSum += options.karma_weight * crimeStats.karma
	crimeSum += options.kill_weight * crimeStats.kills * requiredStats.kills / (ns.getPlayer().numPeopleKilled + 1)
	//ns.tail()
	//ns.print("before money: " + crimeSum)
	crimeSum += options.money_weight * requiredStats.money * Math.pow(ns.singularity.getCrimeChance(crime), 1.5) * crimeStats.money / ns.getPlayer().money
	//ns.print("after money: " + crimeSum)
	crimeSum /= (crimeStats.time / 1e3)
	const longTimePenalty = 1 + (crimeStats.time > 200e3)

	//ns.print("l penalty: " + longTimePenalty + " for " + (crimeStats.time / 1e3).toFixed(0) + "s")
	crimeSum /= longTimePenalty

	ns.tprint("crime: " + crime + " value: " + crimeSum.toFixed(0) + " time: " + (crimeStats.time / 1e3).toFixed(0) + "s")
	return crimeSum * options.crime_factor
}