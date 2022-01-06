import { sum, getServerList } from "utilities.js"

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail()
	let time = 0
	let targetTimes = {}
	while (true) {
		const options = JSON.parse(ns.read("options.script"))
		const targets = getMoneyTarget(ns, options)
		for (const t of targets) {
			if (!(t in targetTimes)) {
				targetTimes[t] = 0
			}
		}
		let servers = getServerList(ns, []).filter(f => ns.hasRootAccess(f))
		await prepareServers(ns, options, servers)

		targetTimes = schedule(ns, options, servers, targets, targetTimes, time)

		if (options.levelUpHack) {
			const [xpServer, xpType] = getXpTarget(ns, options)
			exploitXp(ns, options, servers, xpServer, xpType)
		}
		ns.print("Sleeping for " + options.scheduleLoopTime / 1000 + "s")
		await ns.sleep(options.scheduleLoopTime)
		time += options.scheduleLoopTime
	}
}

function exploitXp(ns, options, servers, target, type) {
	const [nThreads, freeSlots] = getFreeThreadSlots(ns, options, servers)
	let threads = [0, 0, 0]
	if (type == 1) { // weaken
		threads = [0, nThreads, 0]
	} else if (type == 0) { // hack
		const weakenRatio = ns.hackAnalyzeSecurity(1) / 0.05
		const nHack = Math.floor(nThreads / (1 + weakenRatio))
		const nWeaken = nThreads - nHack
		threads = [nHack, nWeaken, 0]
	} else if (type == 2) { // grow
		const weakenRatio = ns.growthAnalyzeSecurity(1) / 0.05
		const nGrow = Math.floor(nThreads / (1 + weakenRatio))
		const nWeaken = nThreads - nGrow
		threads = [0, nWeaken, nGrow]
	}

	deploy(ns, options, threads, target, freeSlots)
}

function getXpTarget(ns, options) {
	const serversJson = JSON.parse(ns.read(options.serverXpFile))
	const servers = Object.keys(serversJson)
	let maxXp = 0
	let maxServer = "n00dles"
	let maxType = 0
	for (const server of servers) {
		for (let i = 0; i < 3; i++) {
			const xp = serversJson[server][i]
			if (xp > maxXp) {
				maxXp = xp
				maxServer = server
				maxType = i
			}
		}
	}
	return [maxServer, maxType]
}

async function prepareServers(ns, options, servers) {
	for (const server of servers) {
		await ns.scp(options.scripts, "home", server)
	}
}

function schedule(ns, options, servers, targets, targetTimes, time) {
	ns.print("targets: " + targets)
	for (const target of targets) {
		if (time < targetTimes[target]) {
			continue
		}
		const [nThreads, freeSlots] = getFreeThreadSlots(ns, options, servers)
		if (nThreads < 3) {
			ns.print("Finished loop!")
			return targetTimes
		}
		let threads = getThreads(ns, options, target, nThreads)
		threads = weakenGrowIfNecessary(ns, options, threads, target)
		deploy(ns, options, threads, target, freeSlots)
		targetTimes[target] = time + ns.getWeakenTime(target)
	}
	return targetTimes
}

function weakenGrowIfNecessary(ns, options, threadsCount, target) {
	if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) * options.securityThreshold) {
		threadsCount[1] += threadsCount[0] + threadsCount[2]
		threadsCount[0] = 0; threadsCount[2] = 0
	} else if (ns.getServerMoneyAvailable(target) < options.onlyGrowThreshold * ns.getServerMaxMoney(target)) {
		threadsCount[2] += threadsCount[0] - 1
		threadsCount[0] = 0
	}
	return threadsCount
}

function deploy(ns, options, threadsCount, target, freeSlots) {
	ns.print("Deploying: " + target + " with " + threadsCount)
	let lastSlot = 0
	let lastUsed = 0
	for (let type = 0; type < threadsCount.length; type++) {
		let numStarted = 0
		while (numStarted < threadsCount[type]) {
			const [server, slots] = freeSlots[lastSlot]
			const available = slots - lastUsed
			const required = threadsCount[type] - numStarted
			const starting = Math.min(available, required)
			let script = options.scripts[type]
			ns.exec(script, server, starting, target)
			lastUsed += starting
			numStarted += starting
			if (available == starting) {
				lastSlot++
				lastUsed = 0
			}
		}
	}
}

export function getThreadsRatio(ns, options, server) {
	let nHack = Math.floor(ns.hackAnalyzeThreads(server, options.hackPercent * ns.getServerMoneyAvailable(server)))
	nHack = Math.min(options.maxThreadRatio, nHack)

	const securityIncreaseHack = (ns.hackAnalyzeSecurity(nHack))
	const searchNWeakenHack = n => (ns.weakenAnalyze(n) < securityIncreaseHack * options.additionalWeakeningPerCycle)
	const nWeakenHack = Math.ceil(binarySearch(searchNWeakenHack, 1, options.maxThreadRatio * nHack)[1])

	const growthNeeded = (1 / (1 - options.hackPercent)) * options.additionalGrowthPerCycle
	const nGrowth = Math.ceil(ns.growthAnalyze(server, growthNeeded))

	const securityIncreaseGrowth = (ns.growthAnalyzeSecurity(nGrowth))
	const searchNWeakenGrowth = n => (ns.weakenAnalyze(n) < securityIncreaseGrowth * options.additionalWeakeningPerCycle)
	const nWeakenGrowth = Math.ceil(binarySearch(searchNWeakenGrowth, 1, options.maxThreadRatio * nHack)[1])
	
	const securityMissing = ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server)
	const nAdditionalWeaken = Math.floor(securityMissing / 0.05)
	let nWeaken = nWeakenHack + nWeakenGrowth
	nWeaken = Math.min(nWeaken + nAdditionalWeaken, 2 * nWeaken)

	return [nHack, nWeaken, nGrowth]
}

function getServerThreads(ns, options, server) {
	let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / options.ramPerThread)
	if (server === options.host) {
		threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - options.keepRam) / options.ramPerThread)
	} else if (server === "home") {
		threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - options.keepRamHome) / options.ramPerThread)
		ns.tprint("Keeping " + options.keepRamHome + "RAM on " + server + " (" + threads + ")")
		ns.tprint("Max ram: " + ns.getServerMaxRam("home") + " used: " + ns.getServerUsedRam("home"))
	}
	return threads
}

// search for the largest value that where f is not true
function binarySearch(f, low, high) {
	let lower = low
	let upper = high
	for (let i = 0; i < 30; i++) {
		let middle = (lower + upper) / 2
		if (f(middle)) {
			lower = middle
		} else {
			upper = middle
		}
	}
	return [lower, upper]
}

export function getTotalThreads(ns, options, servers) {
	let num = 0
	for (const server of servers) {
		num += getServerThreads(ns, options, server)
	}
	return num
}

function getMoneyTarget(ns, options) {
	const serversJson = JSON.parse(ns.read(options.serverFile))
	const servers = Object.keys(serversJson)
	const compareFunction = (s1, s2) => serversJson[s2] - serversJson[s1]
	servers.sort(compareFunction)
	return servers.filter(s => serversJson[s] > 0)
}

function getThreads(ns, options, target, maxNThreads) {
	let threadsCount = getThreadsRatio(ns, options, target)
	while (sum(threadsCount) > maxNThreads) {
		const factor = sum(threadsCount) / maxNThreads
		for (let i = 0; i < threadsCount.length; i++) {
			threadsCount[i] = Math.max(1, Math.floor(threadsCount[i] / factor))
		}
	}
	return threadsCount
}

function getFreeThreadSlots(ns, options, servers) {
	let num = 0
	let slots = []
	for (let i = 0; i < servers.length; i++) {
		const freeThreads = getServerThreads(ns, options, servers[i])
		if (freeThreads > 0) {
			slots.push([servers[i], freeThreads])
			num += freeThreads
		}
	}
	return [num, slots]
}