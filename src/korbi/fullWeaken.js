import { getOptions, getServerThreads } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
    await fullWeaken(ns, ns.args[0])
}

export async function fullWeaken(ns, server) {
	const weakenAmount = 0.05
	const host = "home"
	const script = "weaken.js"
	const options = getOptions(ns)
	while (ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server) * 1.01) {
		const security = ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server)
		const nThreadsRequired = security / weakenAmount / ns.getServer(host).cpuCores
		const nThreadsMax = getServerThreads(ns, options, host)
		ns.print(nThreadsMax)
		const nThreads = Math.min(nThreadsMax, nThreadsRequired)
		if (nThreads > 0) {
			ns.run(script, nThreads, server)
		}
		if (nThreadsRequired == nThreads) return
		const sleepTime = ns.getWeakenTime(server) + 100
		await ns.sleep(sleepTime)
	}
}