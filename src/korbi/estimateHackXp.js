import { getServerList, isHackable, isSecure } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
	const options = JSON.parse(ns.read("options.txt"))
	const times = [ns.getHackTime, ns.getWeakenTime, ns.getGrowTime]
	const scripts = ["hackLoop.ns", "weakenLoop.ns", "growLoop.ns"]
	const purchased = ns.getPurchasedServers()
	const servers = getServerList(ns).filter(s => !purchased.includes(s))
	for (const server of servers) {
		if (isHackable(ns, server) && isSecure(ns, server, options)) {
			let xptable = JSON.parse(ns.read(options.serverXpFile))
			xptable[server] = [0, 0, 0]
			for (let i = 0; i < 3; i++) {
				ns.run(scripts[i], 1, server)
				await ns.asleep(times[i](server) + 100)
				xptable[server][i] = ns.getScriptExpGain(scripts[i], "home", server)
				ns.kill(scripts[i], "home", server)
			}
			await ns.write(options.serverXpFile, JSON.stringify(xptable, null, 2), "w")
		}
	}
}