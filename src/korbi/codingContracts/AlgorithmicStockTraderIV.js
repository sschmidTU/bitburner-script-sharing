import { findallminmax, minmaxsum } from "./AlgorithmicStockTraderII"
import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, stockTrade4)
}

function stockTrade4(data) {
	const [k, d] = data
	const [mins, maxs] = findallminmax(d)
	while (mins.length > k) {
		const [iMin, iMax] = findLowestRemovableTrade(mins, maxs)
		mins.splice(iMin, 1)
		maxs.splice(iMax, 1)
	}

	return minmaxsum(mins, maxs)
}

function findLowestRemovableTrade(mins, maxs) {
	let lowestIMin = 0
	let lowestIMax = 0
	let lowestVal = maxs[0] - mins[0]
	for (let iMin = 1; iMin < mins.length; iMin++) {
		for (let iMax = iMin - 1; iMax <= iMin; iMax++) {
			if (maxs[iMax] - mins[iMin] < lowestVal) {
				lowestIMin = iMin
				lowestIMax = iMax
				lowestVal = maxs[iMax] - mins[iMin]
			}
		}
	}
	return [lowestIMin, lowestIMax]
}