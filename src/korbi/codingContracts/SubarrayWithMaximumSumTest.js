import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, largestSubarray)
}

function largestSubarray(data) {
	let maxSum = 0
	for (let i = 0; i < data.length - 1; i++) {
		for (let j = i+1; j < data.length; j++) {
			const subSum = subarray(data, i, j)
			if (subSum > maxSum) {
				maxSum = subSum
			}
		}
	}
	return maxSum
}

function subarray(data, start, end) {
	let sum = 0
	for (let i = start; i <= end; i++) {
		sum += data[i]
	}
	return sum
}