/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = stockTrade1(ns, data)
	ns.tprint("Solution: " + solution)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function stockTrade1(ns, data) {
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