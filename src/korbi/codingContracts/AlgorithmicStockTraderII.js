import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, stockTrade2)
}

function stockTrade2(data) {
	const [mins, maxs] = findallminmax(data)
	return minmaxsum(mins, maxs)
}

export function minmaxsum(mins, maxs) {
	let totalValue = 0
	for (let i = 0; i < mins.length; i++) {
		totalValue += maxs[i] - mins[i]
	}
	return totalValue
} 

export function findallminmax(data) {
	let mins = []
	let maxs = []
	if (data[0] < data[1]) {
		mins.push(data[0])
	}
	for (let i = 1; i < data.length - 1; i++) {
		if (data[i] < data[i - 1] && data[i] <= data[i + 1]) {
			mins.push(data[i])
		} else if (data[i] > data[i - 1] && data[i] >= data[i + 1]) {
			maxs.push(data[i])
		}
	}
	if (data[data.length - 1] > data[data.length - 2]) {
		maxs.push(data[data.length - 1])
	}
	return [mins, maxs]
}
