import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, minimumPath)
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