/** @param {NS} ns **/
export async function main(ns) {
	const crime = ns.args[0]
    if (ns.getPlayer().crimeType !== "") return
	ns.commitCrime(crime)
}