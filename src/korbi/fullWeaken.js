/** @param {NS} ns **/
export async function main(ns) {
    await fullWeaken(ns, ns.args[0])
}

export async function fullWeaken(ns, server) {
	const weakenAmount = 0.05
	const host = "home"
	const script = "weaken.ns"
	const options = JSON.parse(ns.read("options.script"))
	while (ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server) * 1.01) {
		const security = ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server)
		const nThreadsRequired = security / weakenAmount / ns.getServer("home").cpuCores
		const nThreadsMax = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host) - options.keepRamHome) / ns.getScriptRam(script))
		const nThreads = Math.min(nThreadsMax, nThreadsRequired)
		if (nThreads > 0) {
			ns.run(script, nThreads, server)
		}
		if (nThreadsRequired == nThreads) return
		const sleepTime = ns.getWeakenTime(server) + 10
		await ns.sleep(sleepTime)
	}
}