import { getThreadsRatio } from "./scheduler"
import { getOptions, getServerList, getNumberOfRunningScripts, writeServerMoney } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL")
	await serverLoop(ns)
}

async function serverLoop(ns) {
	const options = getOptions(ns)
	const servers = getServerList(ns).filter(s => !ns.getPurchasedServers().includes(s)).filter(ns.hasRootAccess)
	
	let serversFile = {}
	for (const server of servers) {
		if (ns.getServerMaxMoney(server) > 0) {
			const value = getServerValue(ns, options, server)
			ns.print("getServerValue(" + server + "): " + value.toFixed(3))
			serversFile[server] = value
			ns.print(ns.getServerSecurityLevel(server) + " of " + ns.getServerMinSecurityLevel(server) + " factor " + options.securityThreshold)
			weakenIfNecessary(ns, options, server)
		}
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
	const needsWeakening = ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server) * options.securityThreshold
	const canRunOnHome = getNumberOfRunningScripts(ns, "home", "fullWeaken.js") < options.maxWeakenTargets
	if (needsWeakening && canRunOnHome) {
		ns.print("Weakaning target " + server)
		ns.exec("fullWeaken.js", "home", 1, server)
	}
}