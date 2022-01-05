import { setGoals } from "singularity.js"
/** @param {NS} ns **/
export async function main(ns) {
	await ns.write("servers_money_factor.txt", '{"n00dles":1}', "w")
	await ns.write("tasks.txt", '{"n00dles":"weaken"}', "w")
	await ns.write("backdoors.txt", "", "w")
	ns.rm("factionRepGain.txt")
	await setGoals(ns, JSON.parse(ns.read("options.script")), 100)
	ns.run("up.js")	
}