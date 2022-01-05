import { getServerList } from "utilities.js"

/** @param {NS} ns **/
export async function main(ns) {
	const servers = getServerList(ns)
	for (const server of servers) {
		await scan(ns, server)
	}
}

export async function scan(ns, server) {
	const files = ns.ls(server)
	for (const f of files) {
		if (f.includes(".script") || f.includes(".lit") || f.includes(".txt")) {
			await ns.scp(f, server, "home")
		} else if (!f.includes(".js") && !f.includes(".ns")) { // no self written and deployed script
			ns.run("cct.js", 1, f, server)
		}
	}
}