import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, uniquePaths)
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