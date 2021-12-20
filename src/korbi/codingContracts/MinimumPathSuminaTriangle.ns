/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = minimumPath(data)
	ns.tprint("Solution: " + solution)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function minimumPath(data) {
	let oldPath = [0]
	for (const row of data) {
		let path = []
		for (let i = 0; i < row.length; i++) {
			let right = Infinity
			let left = Infinity
			if (i < oldPath.length) {
				right = oldPath[i] + Number(row[i]) // from right
			}
			if (i > 0) {
				left = oldPath[i - 1] + Number(row[i])
			}
			path.push(Math.min(right, left))
		}
		oldPath = path
	}
	return Math.min(...oldPath)
}