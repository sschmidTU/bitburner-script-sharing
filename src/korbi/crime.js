import { crimeBenefit } from "taskValue.js"
import { getGoals, getOptions, isCriming, keepFocus } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	const p = ns.getPlayer()
	if (keepFocus(ns) || isCriming(ns)) return
	ns.commitCrime(bestCrime(ns))
}

function sortedCrimes(ns) {
	let crimes = ["shoplift", "rob store", "mug someone", "larceny", "deal drugs",
		"bond forgery", "trafficking illegal arms", "homicide", "grand theft auto",
		"kidnap and ransom", "assassinate", "heist"]
	const options = getOptions(ns)
	const reqStats = getGoals(ns)
	crimes.sort((a, b) => crimeBenefit(ns, options, reqStats, b) - crimeBenefit(ns, options, reqStats, a))
	return crimes
}

export function bestCrime(ns) {
	return sortedCrimes(ns)[0]
}
