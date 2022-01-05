/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = waysToSum(ns, data)
	ns.tprint("Solution: " + solution)
	//const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function waysToSum(ns, data) {
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