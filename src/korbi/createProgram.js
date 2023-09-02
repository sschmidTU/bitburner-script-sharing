import { exists, getCrackNames, getOptions, isCriming, keepFocus } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
	if (keepFocus(ns) || isCriming(ns)) return
	createProgram(ns, getOptions(ns))
}


export function createProgram(ns, options) {
	const cracks = getCrackNames()
	const crackLevels = [50, 100, 250, 500, 750]
	const crackPrice = [500e3, 1.5e6, 5e6, 30e6, 250e6]
	const otherProgs = ["AutoLink.exe", "DeepscanV1.exe", "ServerProfiler.exe", "DeepscanV2.exe"]
	const otherLevels = [25, 75, 75, 400]
	const otherPrice = [1e6, 500e3, 500e3, 25e6]
	const progs = cracks//.concat(otherProgs)
	const levels = crackLevels//.concat(otherLevels)
	const prices = crackPrice//.concat(otherPrice)
	for (let i = 0; i < progs.length; i++) {
		if (!exists(ns, progs[i])) {
			if (prices[i] < options.buyProgramThreshold * ns.getPlayer().money) {
				checkBuyTor(ns)
				ns.singularity.purchaseProgram(progs[i])
			} else if (prices[i] > options.workOnProgram * ns.getPlayer().money && ns.getHackingLevel() >= levels[i] && !keepFocus(ns)) {
				ns.print("Creating program: " + progs[i])
				ns.createProgram(progs[i])
				return true
			}
		}
	}
	return false
}

function checkBuyTor(ns) {
	if (!ns.getPlayer().tor)
		ns.singularity.purchaseTor()
}
