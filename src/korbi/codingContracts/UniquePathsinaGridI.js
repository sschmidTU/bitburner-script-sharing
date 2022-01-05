/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	ns.tprint("Task: " + data)
	const solution = uniquePaths(data)
	ns.tprint("Solution: " + solution)
	const result = ns.codingcontract.attempt(solution, filename, server)
	ns.tprint("Result: " + result)
	ns.writePort(1, "" + result)
}

function uniquePaths(data) {
	// n + k - 1 über k, n=rows, k=cols-1
	const n = data[0]
	const k = data[1] - 1
	const res = binomialCoefficient(n+k-1, k)
	return res
}

function binomialCoefficient(n, k) {
	let coeff = 1;
    for (let x = n-k+1; x <= n; x++) coeff *= x;
    for (let x = 1; x <= k; x++) coeff /= x;
    return coeff;
}