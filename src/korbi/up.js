/** @param {NS} ns **/
export async function main(ns) {
	//await ns.write("servers_money_factor.txt", '{"n00dles":1}', "w")
	//ns.run("singularity.ns")
	ns.run("scheduler.js", 1, ...ns.args)
	ns.run("cron.js", 1, ...ns.args)
	//ns.run("scan.ns")
	//ns.run("buyHardware.ns")
	//ns.run("hacknet.ns")
	//ns.run("estimateHackWorth.ns")
}u