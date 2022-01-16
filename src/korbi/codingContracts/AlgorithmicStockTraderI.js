import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, stockTrade1)
}

function stockTrade1(data) {
	const minLeftArr = getMinLeftArr(data)
	let maxTrade = 0
	for (let i = 1; i < data.length; i++) {
		const trade = data[i] - minLeftArr[i-1]
		maxTrade = Math.max(maxTrade, trade)
	}
	return maxTrade
}

function getMinLeftArr(data) {
	let ret = [data[0]]
	for (let i = 1; i < data.length; i++) {
		ret.push(Math.min(ret[i-1], data[i]))
	}
	return ret
}