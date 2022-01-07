import { getCrackNames, exists, connect } from "utilities.js"
import { gymWorkout } from "gym.js"
import { bestCrime } from "crime.js"
import { performAction } from "taskValue.js"
/** @param {NS} ns **/
export async function main(ns) {
	const isMeasuring = ns.scriptRunning("measureFactionRepGain.js", "home")
	const isCriming = ns.getPlayer().crimeType !== ""
	if (isMeasuring || isCriming) return
	ns.disableLog("ALL")
	const optionsFile = "options.script"
	const TODO = [installBackdoor, augment, installAugmentations, createProgram, donate, checkEndgameFaction, performTask]
	const options = JSON.parse(ns.read(optionsFile))
	for (const task of TODO) {
		ns.print(task.name)
		const res = await task(ns, options)
		if (res) {
			break
		}
	}
}

export function performTask(ns, options) {
	if (ns.args[0]) return false
	const institutions = JSON.parse(ns.read("institutions.script"))
	const tasks = JSON.parse(ns.read("tasks.txt"))
	if (tasks.length == 0) return false
	let maxVal = 0
	let bestTask = {}
	if (!tasks.tasks) return false
	for (const task of tasks.tasks) {
		if (task.value > maxVal) {
			maxVal = task.value
			bestTask = task
		}
	}
	if (bestTask.type == "crime") return commitCrime(ns, bestTask.subType)
	return performAction(ns, options, institutions, bestTask)
}

export async function setGoals(ns, options, newLevel = -1) {
	const file = "required_stats.script"
	let req = JSON.parse(ns.read(file))
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
	if (ns.args[0]) return false
	const time = ns.getCrimeStats(crime).time
	const loopTime = 1e3 * JSON.parse(ns.read("cron.txt"))["singularity.js"]
	const n = Math.ceil(loopTime / time)
	ns.tprint(ns.getCrimeStats(crime))
	ns.run("nLoop.js", 1, "simpleCrime.js", n, time, crime)
}

function commitCrimeOld(ns, options) {
	if (ns.args[0]) return false
	if (ns.isBusy() && ns.getPlayer().numPeopleKilled > JSON.parse(ns.read("required_stats.script")).kills) return false
	if (ns.getPlayer().crimeType == "") ns.stopAction()
	ns.tprint("crimesing")
	const crimeScript = "crime.js"
	const time = ns.getCrimeStats(bestCrime(ns)).time
	const loopTime = 1e3 * JSON.parse(ns.read("cron.txt"))["singularity.js"]
	const n = Math.ceil(loopTime / time)
	ns.run("nLoop.js", 1, crimeScript, n, time, ...ns.args)
	return true
}

function workForCompany(ns) {
	if (ns.args[0]) return false
	ns.workForCompany()
	return false
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
			} else if (prices[i] > options.workOnProgram * ns.getPlayer().money && ns.getHackingLevel() >= levels[i] && !ns.args[0]) {
				ns.print("Creating program: " + progs[i])
				ns.createProgram(progs[i])
				return true
			}
		}
	}
	return false
}

function checkBuyTor(ns) {
	if (!ns.getPlayer().tor) {
		ns.purchaseTor()
	}
}

async function installBackdoor(ns) {
	const file = "backdoors.txt"
	const servers = ["powerhouse-fitness", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "fulcrumassets"]//, "w0r1d_d43m0n"]
	for (const server of servers) {
		const canHack = ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && ns.hasRootAccess(server)
		const isBackdoored = ns.read(file).includes(server)
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

function augment(ns, options) {
	const allAugmentations = getAllAugmentationsFromOwnFactions(ns).filter(a => isHackingAug(ns, a[0]))
	const augmentations = allAugmentations.filter(a => isObtainable(ns, a[0], a[1]))
	const sortFunction = (a, b) => ns.getAugmentationPrice(a[0]) - ns.getAugmentationPrice(b[0])
	const condition1 = getNDifferentAugmentations(augmentations) >= options.resetAfterAugmentations - getQueuedAugmentations(ns)
	const condition2 = getNDifferentAugmentations(augmentations) == getNDifferentAugmentations(allAugmentations)
	if (augmentations.length > 0 && (condition1 || condition2)) {
		const sorted = augmentations.filter(notNeuroFlux).sort(sortFunction)
		if (sorted.length > 0) {
			var [aug, f] = sorted[sorted.length - 1]
		} else {
			var [aug, f] = augmentations[0]
		}
		ns.purchaseAugmentation(f, aug)
		ns.tprint("Purchased " + aug + " from " + augmentations)
		return true
	}
}

function getNDifferentAugmentations(augmentations) {
	return (new Set(augmentations.map(a => a[0]))).size
}

function isObtainable(ns, augmentation, faction) {
	return ns.getAugmentationPrice(augmentation) < ns.getPlayer().money && ns.getAugmentationRepReq(augmentation) < ns.getFactionRep(faction)
}

function getAllAugmentationsFromOwnFactions(ns) {
	const ownedAugmentations = ns.getOwnedAugmentations(true)
	let augmentations = []
	for (const f of ns.getPlayer().factions) {
		for (const aug of ns.getAugmentationsFromFaction(f)) {
			if (aug == "NeuroFlux Governor" || !ownedAugmentations.includes(aug)) {
				augmentations.push([aug, f])
			}
		}
	}
	return augmentations
}

async function installAugmentations(ns, options) {
	if (ns.args[0]) return
	if (getQueuedAugmentations(ns) >= options.resetAfterAugmentations) {
		while (augment(ns, options)) { }
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
	await ns.write("options.script", JSON.stringify(options, null, 2), "w")
}

async function checkEndgameFaction(ns, options) {
	ns.tprint("Checking endgame faction")
	for (const faction of ns.getPlayer().factions) {
		if (["ECorp", "NWO", "Fulcrum Secret Technologies", "BitRunners", "Daedalus", "The Covenant", "Illuminati"].includes(faction)) {
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
}

function getQueuedAugmentations(ns) {
	return ns.getOwnedAugmentations(true).length - ns.getOwnedAugmentations(false).length
}

function getFilteredAugmentations(ns) {
	const filterEnoughRep = a => ns.getAugmentationRepReq(a[0]) < ns.getFactionRep(a[1])
	const enoughRepAugs = getAllAugmentationsFromOwnFactions(ns).filter(filterEnoughRep).map(a => a[0])
	const filterNotInEnoughRep = a => !enoughRepAugs.includes(a[0])
	const augmentations = getAllAugmentationsFromOwnFactions(ns).filter(aug => isHackingAug(ns, aug[0])).filter(a => !filterEnoughRep(a)).filter(filterNotInEnoughRep).filter(notNeuroFlux)
	return augmentations
}

async function workForFaction(ns, options) {
	if (ns.args[0]) return false
	const repGainFile = "factionRepGain.txt"
	if (!ns.fileExists(repGainFile)) {
		ns.run("measureFactionRepGain.js")
		return false
	}
	const repGain = JSON.parse(ns.read(repGainFile))
	const missingRepTime = aug => (ns.getAugmentationRepReq(aug[0]) - ns.getFactionRep(aug[1])) / bestRepGain(repGain, aug[1])
	const sortByRep = (a, b) => missingRepTime(a) - missingRepTime(b)
	const augmentations = getFilteredAugmentations(ns).sort(sortByRep)

	if (augmentations.length > 0) {
		const [augmentation, faction] = augmentations[0]
		if (ns.getFactionFavor(faction) >= ns.getFavorToDonate() && getRequiredDonationMoney(ns, ns.getFactionRep(faction) - ns.getAugmentationRepReq(augmentation)) < ns.getPlayer().money) {
			donateUntil(ns, faction, ns.getAugmentationRepReq(augmentation))
		}
		const workType = bestWorkType(repGain, faction)
		ns.tprint("Working for faction " + faction + " as " + workType + " to get " + augmentation + " (" + missingRepTime(augmentations[0]).toFixed(0) + "s)")
		ns.workForFaction(faction, workType)
		if (ns.args[0]) ns.setFocus(false)
		let requiredTime = missingRepTime(augmentations[0])
		const repRequired = await checkEndgameFaction(ns, options, faction)
		if (repRequired) {
			requiredTime = repRequired - ns.getFactionRep(faction) / bestRepGain(repGain, faction)
		}
		if (requiredTime > options.factionSkipTime) {
			return false // a better task can be performed instead
		}
		if (requiredTime > options.factionNotPerformTime) {
			ns.stopAction()
			return false
		}
		return true
	}
	return false
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

function bestRepGain(repGain, faction) {
	return repGainType(repGain, faction, bestWorkType(repGain, faction))
}

function bestWorkType(repGain, faction) {
	let xp = 0
	let maxType = ""
	for (const type of ["Hacking Contracts", "security work", "field work"]) {
		const gain = repGainType(repGain, faction, type)
		if (gain > xp) {
			xp = gain
			maxType = type
		}
	}
	return maxType
}

function repGainType(repGain, faction, type) {
	return repGain[faction + "_" + type]
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

function donateUntil(ns, faction, rep) {
	ns.tprint("need " + rep + " rep ( of " + ns.getFactionRep(faction) + ")")
	if (ns.getFactionRep(faction) > rep) return
	ns.tprint("Donating to " + faction)
	const blocks = 10
	const donationBlock = ns.getPlayer().money / blocks
	for (let i = 0; i < blocks; i++) {
		ns.donateToFaction(faction, donationBlock)
		if (ns.getFactionRep(faction) < rep) return
	}
}