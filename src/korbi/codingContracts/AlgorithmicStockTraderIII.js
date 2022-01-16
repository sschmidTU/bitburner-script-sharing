import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, stockTrade3)
}

function stockTrade3(data) {
	const maxTradeLeft = getMaxTradeLeft(data)
	const maxTradeRight = getMaxTradeRight(data)
	let maxTrade = maxTradeRight[0] // largest single transaction
	for (let i = 0; i < data.length - 1; i++) {
		maxTrade = Math.max(maxTrade, maxTradeLeft[i] + maxTradeRight[i + 1])
	}
	return maxTrade
}

function getMaxTradeRight(data) {
	const maxRightArr = getMaxRightArr(data)
	const maxTrade = new Array(data.length).fill(0)
	for (let i = data.length - 2; i >= 0; i--) {
		const trade = maxRightArr[i + 1] - data[i]
		maxTrade[i] = Math.max(trade, maxTrade[i + 1])
	}
	return maxTrade
}

function getMaxTradeLeft(data) {
	const minLeftArr = getMinLeftArr(data)
	let maxTradeLeft = [0]
	for (let i = 1; i < data.length; i++) {
		const trade = data[i] - minLeftArr[i - 1]
		maxTradeLeft.push(Math.max(maxTradeLeft[i - 1], trade))
	}
	return maxTradeLeft
}

function getMinLeftArr(data) {
	let ret = [data[0]]
	for (let i = 1; i < data.length; i++) {
		ret.push(Math.min(ret[i - 1], data[i]))
	}
	return ret
}

function getMaxRightArr(data) {
	const ret = new Array(data.length).fill(0)
	ret[data.length-1] = data[data.length-1]
	for (let i = data.length - 2; i > 0; i--) {
		ret[i] = Math.max(ret[i + 1], data[i])
	}
	return ret
}