import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, generateIPAdresses)
}

function generateIPAdresses(data) {
	return generateIP(data, 4)
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
	return num == ["0"] || (len > 0) && (len <= 3) && !leadingZero(num) && (Number(num) <= 256)
}

function leadingZero(num) {
	return Number(num) < (10 ** (num.length - 1))
}
