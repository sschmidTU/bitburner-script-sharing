/** @param {NS} ns **/
export async function main(ns) {
	await copyTo(ns, ns.args[0])
}

export async function copyTo(ns, server) {
	const files = ns.ls("home").filter(f => f.includes(".js") || f.includes(".script") || f.includes(".txt"))
    await ns.scp(files, "home", server)
}