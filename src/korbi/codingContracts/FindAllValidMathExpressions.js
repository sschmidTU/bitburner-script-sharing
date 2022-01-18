import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, findAllValid, true)
}

function findAllValid(data, ns) {
	return true
	return findExpressions(data[1], data[0])
}

function findExpressions(data, val) {
    expressions = []
	const withoutFirst = data.slice(1)
	const firstDigit = Number(data[0])
	// +
	const exp = findExpressions(withoutFirst, val - firstDigit)
	for (const e in exp) {
		expressions.push(data[0] + "+" + e)
	}
	// -
	exp = findExpressions(withoutFirst, val + firstDigit)
	for (const e in exp) {
		expressions.push(data[0] + "-" + e)
	}
}