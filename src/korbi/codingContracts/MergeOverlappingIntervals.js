import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, mergeIntervals)
}

function mergeIntervals(data) {
	data.sort((a,b) => a[0] - b[0])
	let i = 1
	while (i < data.length) {
		if (data[i-1][1] >= data[i][0]) {
			data[i-1][1] = Math.max(data[i][1], data[i-1][1])
			data.splice(i, 1)
		} else {
			i++
		}
	}
	return data
}