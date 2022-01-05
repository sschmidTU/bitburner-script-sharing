/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = generateIP(data, 4)
	ns.tprint("Solution: " + solution.map(r => '"' + r + '"'))
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function generateIP(numbers, nBlocks) {
	let ret = []
	if (nBlocks == 1) {
		if (numCheck(numbers)) {
			return [numbers]
		}
		return []
	}
	for (let i = 1; i <= 3; i++) {
		const num = numbers.slice(0, i)
		if (numCheck(num)) {
			for (const ip of generateIP(numbers.slice(i), nBlocks - 1)) {
				ret.push(num + "." + ip)
			}
		}
	}
	return ret
}

function numCheck(num) {
	const len = num.length
	return (len > 0) && (len <= 3) && (Number(num) > (10 ** (len - 1))) && (Number(num) <= 256)
}