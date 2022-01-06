/** @param {NS} ns **/
export async function main(ns) {
	root(ns, ns.args[0])
}

export async function root(ns, server) {
	var num = ns.getServerNumPortsRequired(server)
    var progs = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject]
	for (var i = 0; i < num; i++) {
		await progs[i](server)
	}
	await ns.nuke(server)
}