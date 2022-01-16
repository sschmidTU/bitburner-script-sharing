import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, arrayGame)
}

function arrayGame(data) {
	return isJumpPossible(data)
}

function isJumpPossible(data, i = 0) {
	if (data[i] == 0) return 0
	if (i >= data.length) return 1
	for (let jump = 1; jump <= data[i]; jump++) {
		if (isJumpPossible(data, i + jump) == 1) return 1
	}
	return 0
}