import { getOptions, getServerThreads } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
    await fullWeaken(ns, ns.args[0])
}
/** @param {import(".").NS} ns **/
export async function fullWeaken(ns, target) {
	const host = "home"
	const script = "weaken.js"
	const options = getOptions(ns)
	let nThreadsRequired = requiredThreads(ns, host, target)
	while (ns.getWeakenTime(target) > 3600e3) {
		await ns.sleep(100e3)
	}
	while (nThreadsRequired > 0) {
		const nThreads = Math.min(nThreadsRequired, getServerThreads(ns, options, host))
		if (nThreads > 0) {
			ns.run(script, nThreads, target, nThreadsRequired)
			nThreadsRequired -= nThreads
		}
		await ns.sleep(ns.getWeakenTime(target) / 2 + 200)
	}
}

function requiredThreads(ns, host, target) {
	const weakenAmount = 0.05
	const security = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)
	const nThreadsRequired = security / weakenAmount / ns.getServer(host).cpuCores
	return nThreadsRequired
}