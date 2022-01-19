import { performAction } from "./taskValue"
import { keepFocus, getCrackNames, exists, connect, writeOptions, getOptions, getTasks, getInstitutions, getGoals, getAllAugmentationsFromOwnFactions, enoughRep, getPossibleTargets } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	//ns.tail()
	ns.disableLog("ALL")
	const TODO = [installBackdoor, augment, installAugmentations, createProgram, donate, checkEndgameFaction, performTask]
	const options = getOptions(ns)
	for (const todo of TODO) {
		const isBlocking = await todo(ns, options)
		if (isBlocking) break
	}
}

export function performTask(ns, options=getOptions(ns)) {
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
	const time = ns.getCrimeStats(crime).time
	const loopTime = 20e3
	const n = Math.ceil(loopTime / time)
	ns.print(crime + " " + time + " " + loopTime + " " + n)
	const parameterToDistinguish = ns.getTimeSinceLastAug()
	ns.run("nLoop.js", 1, "simpleCrime.js", n, time, crime, parameterToDistinguish)
	return true
}

export function createProgram(ns, options) {
	const cracks = getCrackNames()
	const crackLevels = [50, 100, 250, 500, 750]
	const crackPrice = [500e3, 1.5e6, 5e6, 30e6, 250e6]
	const otherProgs = ["AutoLink.exe", "DeepscanV1.exe", "ServerProfiler.exe", "DeepscanV2.exe"]
	const otherLevels = [25, 75, 75, 400]
	const otherPrice = [1e6, 500e3, 500e3, 25e6]
	const progs = cracks//.concat(otherProgs)
	const levels = crackLevels//.concat(otherLevels)
	const prices = crackPrice//.concat(otherPrice)
	for (let i = 0; i < progs.length; i++) {
		if (!exists(ns, progs[i])) {
			if (prices[i] < options.buyProgramThreshold * ns.getPlayer().money) {
				checkBuyTor(ns)
				ns.purchaseProgram(progs[i])
			} else if (prices[i] > options.workOnProgram * ns.getPlayer().money && ns.getHackingLevel() >= levels[i] && !keepFocus(ns)) {
				ns.print("Creating program: " + progs[i])
				ns.createProgram(progs[i])
				return true
			}
		}
	}
	return false
}

function checkBuyTor(ns) {
	if (!ns.getPlayer().tor)
		ns.purchaseTor()
}

async function installBackdoor(ns) {
	const file = "backdoors.txt"
	const backdoored = ns.read(file)
	const servers = getPossibleTargets(ns)
	for (const server of servers) {
		const canHack = ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && ns.hasRootAccess(server)
		const isBackdoored = backdoored.includes(server)
		if (canHack && !isBackdoored) {
			ns.tprint("Installing backdoor: " + server)
			connect(ns, server)
			await ns.installBackdoor(server)
			connect(ns, "home")
			await ns.write(file, "\n" + server)
			return false
		}
	}
	return false
}

async function augment(ns, options) {
	const allAugs = getAllAugmentationsFromOwnFactions(ns).filter(a => isHackingAug(ns, a[0]))
	await checkSetEnoughRep(ns, options, allAugs)
	const obtainableAugs = allAugs.filter(a => isObtainable(ns, a[0], a[1])).filter(a => checkForLowerGen(ns, a[0]))
	if (obtainableAugs.length > 0 && (enoughAugsForReset(ns, options, obtainableAugs, allAugs))) {
		const sortFunction = (a, b) => ns.getAugmentationPrice(a[0]) - ns.getAugmentationPrice(b[0])
		const sorted = obtainableAugs.filter(notNeuroFlux).sort(sortFunction)
		if (sorted.length > 0) {
			var [aug, f] = sorted[sorted.length - 1]
		} else {
			var [aug, f] = obtainableAugs[0]
		}
		ns.purchaseAugmentation(f, aug)
		ns.tprint("Purchased " + aug + " from " + f + " for " + ns.getAugmentationPrice(aug) / 1e6 + "M")
		return true
	}
}

function checkForLowerGen(ns, aug) {
	if (!aug.includes(" - Gen ")) return true
	const parts = aug.split(" ")
	const gen = parts.pop()
	if (gen == "I") return true
	const oneLower = {"II": "I", "III": "II", "IV": "III", "V": "IV"}
	const lowerGen = oneLower[gen]
	const lowerAug = [...parts, lowerGen].join(" ")
	return ns.getOwnedAugmentations(true).includes(lowerAug)
}

function enoughAugsForReset(ns, options, obtainableAugs, allAugs) {
	const nObtainable = getNDifferentAugs(obtainableAugs)
	const enoughAugs = nObtainable >= options.resetAfterAugmentations - getNQueuedAugs(ns)
	const allPossibleAugs = nObtainable == getNDifferentAugs(allAugs)
	return enoughAugs || allPossibleAugs
}

async function checkSetEnoughRep(ns, options, allAugs) {
	const enoughRepAugs = allAugs.filter(a => enoughRep(ns, a[0], a[1]))
	let money_weight = 1
	ns.print("Number of Augs with enough Rep: " + getNDifferentAugs(enoughRepAugs))
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

function isObtainable(ns, augmentation, faction) {
	return enoughMoney(ns, augmentation) && enoughRep(ns, augmentation, faction)
}

function enoughMoney(ns, augmentation) {
	return ns.getAugmentationPrice(augmentation) < ns.getPlayer().money
}

async function installAugmentations(ns, options) {
	if (keepFocus(ns)) return
	if (getNQueuedAugs(ns) >= options.resetAfterAugmentations) {
		while (await augment(ns, options)) { }
		await nextFactionGroup(ns)
		ns.scriptKill("cron.js", "home")
		ns.scriptKill("scheduler.js", "home")
		ns.tprint("Resetting in 10s")
		await ns.sleep(10000)
		ns.tprint("Resetting!")
		await ns.installAugmentations("reset.js")
		await ns.sleep(10000)
		await ns.softReset("reset.js")
	}
}

async function nextFactionGroup(ns) {
	let options = JSON.parse(ns.read("options.script"))
	options.factionGroup = (options.factionGroup % 3) + 1
	await writeOptions(ns, options)
}

async function checkEndgameFaction(ns, options) {
	ns.print("Checking endgame faction")
	for (const faction of ns.getPlayer().factions) {
		if (["ECorp", "NWO", "Fulcrum Secret Technologies", "BitRunners", "Daedalus", "The Covenant", "Illuminati", "Speakers for the Dead"].includes(faction)) {
			const favor = ns.getFactionFavor(faction)
			const gain = ns.getFactionFavorGain(faction)
			const condition1 = favor < options.endGameFavorReset[0] - 30 && favor + gain >= options.endGameFavorReset[0]
			const condition2 = favor < options.endGameFavorReset[1] && favor + gain >= options.endGameFavorReset[1]
			ns.tprint("Eearly reset: " + condition1 + " " + condition2)
			if (condition1 || condition2) {
				ns.tprint("Resetting for endgame faction: " + faction)
				const n = options.resetAfterAugmentations
				options.resetAfterAugmentations = 0
				for (let _ = 0; _ < n; _++) {
					augment(ns, options)
				}
				await installAugmentations(ns, options)
			}
		}
	}
	return false
}

function getNQueuedAugs(ns) {
	return ns.getOwnedAugmentations(true).length - ns.getOwnedAugmentations(false).length
}

function getFilteredAugmentations(ns) {
	const filterEnoughRep = a => ns.getAugmentationRepReq(a[0]) < ns.getFactionRep(a[1])
	const enoughRepAugs = getAllAugmentationsFromOwnFactions(ns).filter(filterEnoughRep).map(a => a[0])
	const filterNotInEnoughRep = a => !enoughRepAugs.includes(a[0])
	const augmentations = getAllAugmentationsFromOwnFactions(ns).filter(aug => isHackingAug(ns, aug[0])).filter(a => !filterEnoughRep(a)).filter(filterNotInEnoughRep).filter(notNeuroFlux)
	return augmentations
}

function donate(ns, options) {
	for (const aug of getFilteredAugmentations(ns)) {

		const [augmentation, faction] = aug
		const hasEnoughFavor = ns.getFactionFavor(faction) >= ns.getFavorToDonate()
		const reqMoney = -getRequiredDonationMoney(ns, ns.getFactionRep(faction) - ns.getAugmentationRepReq(augmentation))
		const hasEnoughMoney = reqMoney < ns.getPlayer().money
		//ns.tprint("Donating to " + faction + " if " + hasEnoughFavor + " and " + hasEnoughMoney + " to get " + augmentation)
		//ns.tprint((reqMoney / 1e9).toFixed(1) + "B")
		if (hasEnoughFavor && hasEnoughMoney) {
			ns.tprint("Donating to " + faction + " now!")
			ns.donateToFaction(faction, reqMoney)
			return false
		}
	}
}


export function isHackingAug(ns, augName) {
	return true
	const augStats = ns.getAugmentationStats(augName)
	let n = 0
	for (const stat in augStats) {
		n++
		if (stat.startsWith("hacking") || stat.startsWith("faction")) {
			return true
		}
	}
	return n == 0 // if no stats, buy it
}

function getRequiredDonationMoney(ns, reputation) {
	return reputation / ns.getPlayer().faction_rep_mult * 1e6
}

function notNeuroFlux(augmentation) {
	return augmentation[0] !== "NeuroFlux Governor"
}
