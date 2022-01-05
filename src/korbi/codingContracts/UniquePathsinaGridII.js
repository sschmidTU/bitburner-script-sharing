/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = uniqueBlockedPaths(data)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function uniqueBlockedPaths(data, cache = {}, start = [0, 0]) {
	if (start[0] >= data.length) return 0
	if (start[1] >= data[0].length) return 0
	if (data[start[0]][start[1]] == 1) return 0
	if (start[0] == data.length - 1 && start[1] == data[0].length - 1) return 1
	if (start in cache) return cache[start]
	const val = uniqueBlockedPaths(data, cache, [start[0] + 1, start[1]]) + uniqueBlockedPaths(data, cache, [start[0], start[1] + 1])
	cache[start] = val
	return val
}