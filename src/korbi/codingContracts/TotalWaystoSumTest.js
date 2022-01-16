import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, waysToSum)
}

function waysToSum(data) {
	let allWays = [0, 1]
	for (let i = 2; i <= data; i++) {
		let ways = 0
		for (let j = 1; j < i; j++) {
			ways += allWays[j]
		}
		allWays.push(ways)
	}
	return allWays[data]
}