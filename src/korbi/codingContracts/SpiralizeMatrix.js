import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, spiralizeMatrix)
}

function spiralizeMatrix(data) {
	const size = [data.length, data[0].length]
	let result = []
	let border = [[-1, size[0]], [-1, size[1]]]
	let step = [0, 1]
	let i = [0, 0]
	for (let _ = 0; _ < size[0] * size[1]; _++) {
		result.push(data[i[0]][i[1]])
		if (border[0].includes(i[0] + step[0])) {
			let borderChange = 0 //Math.max(0, step[0])
			if (step[0] == 1) {
				borderChange = 1
			}
			border[1][borderChange] -= step[0]
			step = [0, -step[0]]
		} else if (border[1].includes(i[1] + step[1])) {
			let borderChange = 1 //Math.max(0, -step[1])
			if (step[1] == 1) {
				borderChange = 0
			}
			border[0][borderChange] += step[1]
			step = [step[1], 0]
		}

		i[0] += step[0]
		i[1] += step[1]
	}
	return result
}