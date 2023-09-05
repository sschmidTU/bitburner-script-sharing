/** @param {NS} ns **/
export async function main(ns) {
	copyTo(ns, ns.args[0])
}

/** @param {import(".").NS } ns */
export function copyTo(ns, server) {
	const files = ns.ls("home").filter(f => f.includes(".js") || f.includes(".script") || f.includes(".txt"))
    ns.scp(files, server, "home")
}