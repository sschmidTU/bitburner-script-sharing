import { getServerList, isHackable, getServerXp, writeServerXp } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL")
	const times = [ns.getHackTime, ns.getWeakenTime, ns.getGrowTime]
	const scripts = ["hackLoop.ns", "weakenLoop.ns", "growLoop.ns"]
	const servers = getServerList(ns).filter(s => !ns.getPurchasedServers().includes(s))
	for (const server of servers) {
		if (isHackable(ns, server))
			await updateXpTable(ns, server, times, scripts)
	}
}

async function updateXpTable(ns, server, times, scripts) {
	let xptable = getServerXp(ns)
	xptable[server] = [0, 0, 0]
	for (let i = 0; i < 3; i++) {
		if (times[i](server) > 100e3) continue
		ns.run(scripts[i], 1, server)
		await ns.asleep(times[i](server) + 100)
		xptable[server][i] = ns.getScriptExpGain(scripts[i], "home", server)
		ns.kill(scripts[i], "home", server)
	}
	await writeServerXp(ns, xptable)
}