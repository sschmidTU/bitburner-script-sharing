/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = findExpressions(ns, data[1], data[0])
	ns.tprint("Solution: " + solution)
	//const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function findExpressions(ns, data, val) {
    expressions = []
	const withoutFirst = data.slice(1)
	const firstDigit = Number(data[0])
	// +
	const exp = findExpressions(ns, withoutFirst, val - firstDigit)
	for (const e in exp) {
		expressions.push(data[0] + "+" + e)
	}
	// -
	exp = findExpressions(ns, withoutFirst, val + firstDigit)
	for (const e in exp) {
		expressions.push(data[0] + "-" + e)
	}
}