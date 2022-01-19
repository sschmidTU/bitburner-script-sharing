import { getThreadsRatio } from "./scheduler"
import { getOptions, getNumberOfRunningScripts, writeServerMoney, getPossibleTargets, needsWeakening } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL")
	await serverLoop(ns)
}

async function serverLoop(ns) {
	const options = getOptions(ns)
	
	let serversFile = {}
	for (const server of getPossibleTargets(ns)) {
		const value = getServerValue(ns, options, server)
		serversFile[server] = value
		weakenIfNecessary(ns, options, server)

		ns.print("getServerValue(" + server + "): " + value.toFixed(3))
		ns.print(ns.getServerSecurityLevel(server) + " of " + ns.getServerMinSecurityLevel(server) + " factor " + options.securityThreshold)
		
		await ns.sleep(200)
	}
	await writeServerMoney(ns, serversFile)
}

function getServerValue(ns, options, s) {
	let timeThreads = 0
	const threads = getThreadsRatio(ns, options, s)
	const times = [ns.getHackTime(s), ns.getWeakenTime(s), ns.getGrowTime(s)]
	for (let i = 0; i < times.length; i++) {
		timeThreads += threads[i] * times[i] / threads[0]
	}
	const moneyAverage = (ns.getServerMaxMoney(s) + ns.getServerMoneyAvailable(s)) / 2
	return moneyAverage * ns.hackAnalyzeChance(s) * ns.hackAnalyze(s) / timeThreads
}

function weakenIfNecessary(ns, options, server) {
	const canRunOnHome = getNumberOfRunningScripts(ns, "home", "fullWeaken.js") < options.maxWeakenTargets
	if (canRunOnHome && needsWeakening(ns, options, server)) {
		ns.print("Weakaning target " + server)
		ns.exec("fullWeaken.js", "home", 1, server)
	}
}