import { crimeBenefit } from "taskValue.js"
/** @param {NS} ns **/
export async function main(ns) {
	const p = ns.getPlayer()
	if (ns.args[0] || p.crimeType !== "" || p.createProgramName != "") return
	ns.commitCrime(bestCrime(ns))
}

function sortedCrimes(ns) {
	let crimes = ["shoplift", "rob store", "mug someone", "larceny", "deal drugs",
		"bond forgery", "trafficking illegal arms", "homicide", "grand theft auto",
		"kidnap and ransom", "assassinate", "heist"]
	const options = JSON.parse(ns.read("options.script"))
	const reqStats = JSON.parse(ns.read("required_stats.script"))
	crimes.sort((a, b) => crimeBenefit(ns, options, reqStats, b) - crimeBenefit(ns, options, reqStats, a))
	return crimes
}

export function bestCrime(ns) {
	return sortedCrimes(ns)[0]
}
