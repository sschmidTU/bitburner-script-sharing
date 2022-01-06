import { createProgram } from "singularity.js"
/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args[0] || ns.getPlayer().crimeType !== "") return
	const options = JSON.parse(ns.read("options.script"))
	createProgram(ns, options)
}