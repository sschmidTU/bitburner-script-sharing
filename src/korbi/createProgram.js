import { createProgram } from "./singularity"
import { getOptions, isCriming, keepFocus } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	if (keepFocus(ns) || isCriming(ns)) return
	createProgram(ns, getOptions(ns))
}