import { getServerList, execute } from "utilities.js"

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
		if (isStory(f)) {
			await ns.scp(f, server, "home")
		} else if (isCodingContract(f)) {
			ns.tprint("running cct")
			await ns.write("run_script.script", "\ncct.js " + f + " " + server)
			//ns.spawn("cct.js", 1, f, server)
		}
	}
}

function isStory(file) {
	return file.includes(".lit") || file.includes(".txt")
}

function isCodingContract(file) {
	return file.includes(".cct")
}