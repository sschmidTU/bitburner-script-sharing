import { createProgram } from "./createProgram"
import { performAction } from "./taskValue"
import { keepFocus, writeOptions, getOptions, getTasks, getInstitutions, getGoals, getAllWantedAugmentationsFromOwnFactions, enoughRep } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	//ns.tail()
	ns.disableLog("ALL")
	const TODO = [installBackdoor, buyAugmentationIfReady, installAugmentations, createProgram, donate, checkEndgameFaction, performTask]
	const options = getOptions(ns)
	for (const todo of TODO) {
		const isBlocking = await todo(ns, options)
		if (isBlocking) break
	}
}

export function performTask(ns, options = getOptions(ns)) {
	if (keepFocus(ns)) return false

	const tasks = getTasks(ns)
	if (tasks.length == 0) return false

	const bestTask = getBestTask(tasks)
	ns.tprint("Task: " + bestTask.type + " sub: " + bestTask.subType + " val: " + bestTask.value)

	if (bestTask.type == "crime")
		return commitCrime(ns, bestTask.subType)

	const institutions = getInstitutions(ns)
	return performAction(ns, options, institutions, bestTask)
}

function getBestTask(tasks) {
	let maxVal = 0
	let bestTask = {}
	for (const task of tasks) {
		if (task.value > maxVal) {
			maxVal = task.value
			bestTask = task
		}
	}
	return bestTask
}

export async function setGoals(ns, options, newLevel = -1) {
	let req = getGoals(ns)
	if (newLevel == -1) {
		for (let i = 0; i < options.reqLevels.length; i++) {
			if (options.reqLevels[i] == req.strength) {
				newLevel = options.reqLevels[Math.min(i + 1, options.reqLevels.length - 1)]
			}
			if (ns.getPlayer().strength < req.strength) {
				return
			}
		}
	}
	for (const stat of options.combat_stats) {
		req[stat] = newLevel
	}
	for (const stat of ["hacking", "charisma"]) {
		req[stat] = Math.min(newLevel, 300)
	}
	req["kills"] = Math.min(30, Math.ceil(newLevel / 10))
	await ns.write(file, JSON.stringify(req, null, 2), "w")
}

function commitCrime(ns, crime) {
	if (keepFocus(ns)) return false
	const time = ns.singularity.getCrimeStats(crime).time
	const loopTime = 20e3
	const n = Math.ceil(loopTime / time)
	ns.tprint(crime + " " + time + " " + loopTime + " " + n)
	const parameterToDistinguish = ns.getTimeSinceLastAug()
	ns.run("nLoop.js", 1, "simpleCrime.js", n, time, crime, parameterToDistinguish)
	return true
}

async function installBackdoor(ns) {
	const backdoored = ns.read("backdoors.txt")
	const servers = ["powerhouse-fitness", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "fulcrumassets", "w0r1d_d43m0n"]//getPossibleTargets(ns)
	for (const server of servers) {
		const canHack = ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && ns.hasRootAccess(server)
		const isBackdoored = backdoored.includes(server)
		if (canHack && !isBackdoored) {
			ns.exec("installBackdoor.js", "home", 1, server)
			return false
		}
	}
	return false
}

async function buyAugmentationIfReady(ns, options) {
	const allAugs = getAllWantedAugmentationsFromOwnFactions(ns)
	await checkSetMoneyFactorIfEnoughRep(ns, options, allAugs)
	const obtainableAugs = allAugs.filter(a => isObtainable(ns, a[0], a[1]))
	if (enoughAugsForReset(ns, options, obtainableAugs, allAugs))
		return augment(ns, obtainableAugs)
}

function augment(ns, augs) {
	const augValue = aug => ns.singularity.getAugmentationPrice(aug) * ns.singularity.getAugmentationRepReq(aug)
	const sortFunction = (a, b) => augValue(a[0]) - augValue(b[0])
	const sorted = augs.filter(a => notNeuroFlux(a[0])).sort(sortFunction)
	if (sorted.length > 0)
		var [aug, f] = sorted[sorted.length - 1]
	else
		var [aug, f] = augs[0]

	ns.tprint("Purchase " + aug + " from " + f + " for " + ns.singularity.getAugmentationPrice(aug) / 1e6 + "M")
	const success = ns.singularity.purchaseAugmentation(f, aug)
	ns.tprint("Success: " + success)
	return true
}

function checkForLowerGen(ns, aug) {
	const oneLower = { "II": "I", "III": "II", "IV": "III", "V": "IV" }
	const parts = aug.split(" ")
	const gen = parts.pop()
	if (!Object.keys(oneLower).includes(gen)) return true
	const lowerGen = oneLower[gen]
	const lowerAug = [...parts, lowerGen].join(" ")
	return ns.singularity.getOwnedAugmentations(true).includes(lowerAug)
}

function enoughAugsForReset(ns, options, obtainableAugs, allAugs) {
	if (obtainableAugs.length == 0) return false
	const nObtainable = getNDifferentAugs(obtainableAugs)
	const enoughAugs = nObtainable >= options.resetAfterAugmentations - getNQueuedAugs(ns)
	const allPossibleAugs = nObtainable == getNDifferentAugs(allAugs)
	return enoughAugs || allPossibleAugs
}

async function checkSetMoneyFactorIfEnoughRep(ns, options, allAugs) {
	const enoughRepAugs = allAugs.filter(a => enoughRep(ns, a[0], a[1]))
	let money_weight = 1
	ns.tprint("Number of Augs with enough Rep: " + getNDifferentAugs(enoughRepAugs))
	if (enoughAugsForReset(ns, options, enoughRepAugs, allAugs)) {
		money_weight = options.needMoneyFactor
	}
	if (options.money_weight != money_weight) {
		options.money_weight = money_weight
		await writeOptions(ns, options)
	}
}

function getNDifferentAugs(augmentations) {
	return (new Set(augmentations.map(a => a[0]))).size
}

export function isObtainable(ns, aug, faction) {
	return enoughMoney(ns, aug) && enoughRep(ns, aug, faction) && checkForLowerGen(ns, aug)
}

function enoughMoney(ns, augmentation) {
	return ns.singularity.getAugmentationPrice(augmentation) < ns.getPlayer().money
}

async function installAugmentations(ns, options, force = false) {
	if (getNQueuedAugs(ns) >= options.resetAfterAugmentations || force) {
		if (keepFocus(ns)) {
			ns.tprint("Not resetting because of focus!")
			return
		}

		while (await buyAugmentationIfReady(ns, options)) { }
		await nextFactionGroup(ns)
		ns.scriptKill("cron.js", "home")
		ns.scriptKill("scheduler.js", "home")
		ns.tprint("Resetting in 10s")
		await ns.sleep(10000)
		ns.tprint("Resetting!")
		await ns.singularity.installAugmentations("reset.js")
		await ns.sleep(10000)
		await ns.softReset("reset.js")
	}
}

async function nextFactionGroup(ns) {
	let options = getOptions(ns)
	options.factionGroup = (options.factionGroup % 3) + 1
	await writeOptions(ns, options)
}

async function checkEndgameFaction(ns, options) {
	ns.tprint("Checking endgame faction")
	for (const faction of ns.getPlayer().factions) {
		if (isEndgameFaction(ns, faction)) {
			const favor = ns.singularity.getFactionFavor(faction)
			const gain = ns.singularity.getFactionFavorGain(faction)
			const condition1 = favor < options.endGameFavorReset[0] - 30 && favor + gain >= options.endGameFavorReset[0]
			const condition2 = favor < options.endGameFavorReset[1] && favor + gain >= options.endGameFavorReset[1]
			if (condition1 || condition2) {
				ns.tprint("Resetting for endgame faction: " + faction)
				await installAugmentations(ns, options, true)
			}
		}
	}
	return false
}

//["ECorp", "NWO", "Fulcrum Secret Technologies", "BitRunners", "Daedalus", "The Covenant", "Illuminati", "Speakers for the Dead"]
export function isEndgameFaction(ns, faction) {
	return ns.singularity.getAugmentationsFromFaction(faction).filter(notNeuroFlux).map(ns.singularity.getAugmentationRepReq).sort()[0] > 500e3
}

function getNQueuedAugs(ns) {
	return ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length
}

function getFilteredAugmentations(ns) {
	const enoughRep = a => ns.singularity.getAugmentationRepReq(a[0]) < ns.singularity.getFactionRep(a[1])
	const enoughRepAugs = getAllWantedAugmentationsFromOwnFactions(ns).filter(enoughRep).map(a => a[0])
	const inEnoughRepAugs = a => enoughRepAugs.includes(a[0])
	const augmentations = getAllWantedAugmentationsFromOwnFactions(ns)
		.filter(a => !inEnoughRepAugs(a))
		.filter(a => notNeuroFlux(a[0]))
	return augmentations
}

function donate(ns, options) {
	for (const aug of getFilteredAugmentations(ns)) {
		const [augmentation, faction] = aug
		if (ns.singularity.getFactionFavor(faction) < ns.getFavorToDonate()) return false

		const reqMoney = -getRequiredDonationMoney(ns, ns.singularity.getFactionRep(faction) - ns.singularity.getAugmentationRepReq(augmentation))
		//ns.tprint("need: " + reqMoney / 1e6 + "M for " + augmentation + " rep: " + ns.singularity.getAugmentationRepReq(augmentation) /1e3 + "k")
		//ns.tprint("Donating to " + faction + " if " + hasEnoughFavor + " and " + hasEnoughMoney + " to get " + augmentation)
		//ns.tprint((reqMoney / 1e9).toFixed(1) + "B")
		if (reqMoney < ns.getPlayer().money) {
			//ns.tprint("Donating to " + faction + " now!")
			//ns.tprint("rep: " + ns.singularity.getFactionRep(faction)/1e3 + "k")
			ns.donateToFaction(faction, reqMoney)
			ns.tprint("Donate: " + (reqMoney / 1e6).toFixed(0) + "M to " + faction + " for " + augmentation)
			//ns.tprint("rep: " + ns.singularity.getFactionRep(faction))
			return false
		}
	}
}

function getRequiredDonationMoney(ns, reputation) {
	return reputation / ns.getPlayer().faction_rep_mult * 1e6
}

function notNeuroFlux(aug) {
	return !aug.includes("NeuroFlux Governor")
}
