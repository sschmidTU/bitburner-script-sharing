/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = isJumpPossible(data)
	ns.tprint("Solution: " + solution)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function isJumpPossible(data, i = 0) {
	if (data[i] == 0) return 0
	if (i >= data.length) return 1
	for (let jump = 1; jump <= data[i]; jump++) {
		if (isJumpPossible(data, i + jump) == 1) return 1
	}
	return 0
}