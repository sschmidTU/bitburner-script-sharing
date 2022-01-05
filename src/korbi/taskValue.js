import { workout } from "gym.js"
/** @param {NS} ns **/
export async function main(ns) {
	await buildTable(ns)
	if (ns.args[0]) return
	ns.run("runin.js", 1, 1, "singularity.js")
	/*
	const institutions = JSON.parse(ns.read("institutions.txt"))
	//const task = { "type": "work", "at": "ECorp", "subType": "Hacking contracts" }
	//const task = { "type": "work", "at": "KuaiGong International", "subType": "IT job" }
	const task = { "type": "faction", "at": "Slum Snakes", "subType": "field work" }
	const options = JSON.parse(ns.read("options.txt"))
	const statsGoal = JSON.parse(ns.read("required_stats.txt"))
	//ns.tprint(taskValue(ns, options, statsGoal, task))
	const statsGain = measure(ns, options, institutions, task)
	ns.tprint(statsGain)
	ns.tprint(taskValue(ns, options, institutions, statsGoal, task))
	*/
}

async function buildTable(ns) {
	const options = JSON.parse(ns.read("options.script"))
	const statsGoal = JSON.parse(ns.read("required_stats.script"))
	const institutions = JSON.parse(ns.read("institutions.script"))

	const table = { "tasks": [] }
	for (let task of allTasks(ns, institutions)) {
		task.value = taskValue(ns, options, institutions, statsGoal, task)
		table["tasks"].push(task)
	}
	await ns.write("tasks.txt", JSON.stringify(table, null, 2), "w")
}

function allTasks(ns, institutions) {
	const jobs = ["IT", "software", "security", "business"]
	const factionWork = ["Hacking Contracts", "security work", "field work"]
	const crimes = ["shoplift", "rob store", "mug someone", "larceny", "deal drugs",
		"bond forgery", "trafficking illegal arms", "homicide", "grand theft auto",
		"kidnap and ransom", "assassinate", "heist"]
	const workoutStats = ["strength", "defense", "dexterity", "agility", "charisma"]
	let tasks = []
	for (const stat of workoutStats) {
		tasks.push({ "type": "train", "subType": stat })
	}
	for (const crime of crimes) {
		tasks.push({ "type": "crime", "subType": crime })
	}
	for (const faction of ns.getPlayer().factions) {
		for (const work of factionWork) {
			tasks.push({ "type": "faction", "at": faction, "subType": work })
		}
	}
	for (const company in institutions.corporations) {
		for (const job of jobs) {
			tasks.push({ "type": "work", "at": company, "subType": job })
		}
	}
	return tasks
}
/*
function taskValue(ns, options, statsGoal, task) {
	const valueFunction = {
		"crime": crimeBenefit,
		"work": workBenefit,
		"train": workout
	}
	return valueFunction(ns, options, statsGoal, task)
}
*/

function isOwnFaction(ns, corp) {
	for (const faction of ns.getPlayer().factions) {
		if (faction == corp) return true
		if (faction.includes("ulcrum") && corp.includes("ulcrum")) return true
	}
	return false
}

function taskValue(ns, options, institutions, statsGoal, task) {
	if (task.type == "crime") return crimeBenefit(ns, options, statsGoal, task.subType)
	if (task.type == "work" && isOwnFaction(ns, task.at)) return 0
	const statsGain = measure(ns, options, institutions, task)
	const p = ns.getPlayer()
	const stats = ["agility", "dexterity", "strength", "defense", "charisma", "hacking", "money"]
	let value = 0
	for (const stat of stats) {
		value += statsGain[stat] * statsGoal[stat] / p[stat] * options[stat + "_weight"]
	}
	if (["work", "faction"].includes(task.type)) {
		task.time = reputationTime(ns, options, statsGain.rep, task)
		value += options.repDefaultTime / task.time
	}
	return value
}

function reputationTime(ns, options, repGain, task) {
	if (task.type == "work") {
		const rep = requiredReputation(task.at)
		return (rep - ns.getCompanyRep(task.at)) / repGain
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
	const factionRep = ns.getFactionRep(faction)
	const missingRepTime = aug => (ns.getAugmentationRepReq(aug) - factionRep) / repGain
	const sortByRep = (a, b) => missingRepTime(a) - missingRepTime(b)
	const filterNotEnoughRep = aug => ns.getAugmentationRepReq(aug) > factionRep
	const filterOwnedAugmentations = aug => !ns.getOwnedAugmentations(true).includes(aug)
	const augmentations = ns.getAugmentationsFromFaction(faction).filter(filterOwnedAugmentations).filter(filterNotEnoughRep).filter(notNeuroFlux).sort(sortByRep)
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
	ns.stopAction()
	performAction(ns, options, institutions, task)
	const rate = getStats(ns)
	ns.stopAction()
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
			if (ns.getPlayer().money > 1e6) {
				ns.travelToCity(city)
			} else {
				return false
			}
		}
		ns.applyToCompany(task.at, task.subType)
		ns.workForCompany(task.at, task.subType)
	}
	if (task.type == "faction") {
		ns.workForFaction(task.at, task.subType)
	}
	if (task.type == "crime") return ns.commitCrime(task.subType)
	if (task.type == "train") return workout(ns, task.subType)
	return task.value > options.taskValueThreshold
}

function crimeBenefit(ns, options, requiredStats, crime) {
	let crimeSum = 0
	const crimeStats = ns.getCrimeStats(crime)
	const stats = ["agility", "dexterity", "strength", "defense", "charisma", "hacking"]
	for (const stat of stats) {
		crimeSum += crimeStats[stat + "_exp"] * (1 + ns.getCrimeChance(crime) * crimeStats[stat + "_success_weight"]) * options[stat + "_weight"] * requiredStats[stat] / ns.getPlayer()[stat]
	}
	crimeSum += options.karma_weight * crimeStats.karma
	crimeSum += options.kill_weight * crimeStats.kills * requiredStats.kills / (ns.getPlayer().numPeopleKilled + 1)
	crimeSum += options.money_weight * ns.getCrimeChance(crime) * crimeStats.money / ns.getPlayer().money
	crimeSum /= (crimeStats.time / 1e3)
	return crimeSum * options.crime_factor
}