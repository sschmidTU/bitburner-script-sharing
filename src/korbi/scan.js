import { getAllServers } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
	const servers = getAllServers(ns).filter(s => !ns.getPurchasedServers().includes(s))
	for (const server of servers) {
		await scan(ns, server)
		await ns.sleep(100)
	}
}

export async function scan(ns, server) {
	if (server === "home") return
	for (const f of ns.ls(server)) {
		if (isStory(f))
			await ns.scp(f, "home", server)
		else if (isCodingContract(f))
			ns.run("cct.js", 1, f, server)
			//await addCodingContractToCron(ns, server, f)
	}
}

async function addCodingContractToCron(ns, server, f) {
	await ns.write("run_script.script", "\ncct.js " + f + " " + server)
}

function isStory(file) {
	return file.includes(".lit")
}

function isCodingContract(file) {
	return file.includes(".cct")
}