import { getThreadsRatio } from "scheduler.js"
import { getServerList, getNumberOfRunningScripts } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL")
	const optionsFile = "options.script"
	const options = JSON.parse(ns.read(optionsFile))
	await serverLoop(ns, options)
}

async function serverLoop(ns, options) {
	const filename = "servers_money_factor.txt"
	if (ns.ls("home", filename).length == 0) {
		await ns.write(filename, "{}", "w")
	}

	const servers = getServerList(ns)
	
	let serversFile = JSON.parse(ns.read(filename))
	let minWeakenTime = Infinity
	for (const server of servers) {
		if (ns.getServerMaxMoney(server) > 0) {
			minWeakenTime = Math.min(minWeakenTime, ns.getWeakenTime(server))
			const value = getServerValue(ns, options, server)
			ns.print("getServerValue(" + server + "): " + value.toFixed(2))
			serversFile[server] = value
			if ((ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server) * options.securityThreshold) && (getNumberOfRunningScripts(ns, "home", "fullWeaken.js") < options.maxWeakenTargets)) {
				ns.print("Weakaning target " + server)
				ns.run("fullWeaken.js", 1, server)
			}
		}
		await ns.sleep(100)
	}
	await ns.write(filename, JSON.stringify(serversFile, null, 2), "w")
	await ns.write("min_weaken_time.txt", minWeakenTime, "w")
}

function getServerValue(ns, options, s) {
	let timeThreads = 0
	const threads = getThreadsRatio(ns, options, s)
	const times = [ns.getHackTime(s), ns.getWeakenTime(s), ns.getGrowTime(s)]
	for (let i = 0; i < times.length; i++) {
		timeThreads += threads[i] * times[i] / threads[0]
	}
	return ns.getServerMaxMoney(s) * ns.hackAnalyzeChance(s) * ns.hackAnalyze(s) / timeThreads
}