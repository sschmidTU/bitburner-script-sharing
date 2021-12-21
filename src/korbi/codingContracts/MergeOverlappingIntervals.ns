/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = mergeIntervals(data)
	ns.tprint("Solution: " + solution)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
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