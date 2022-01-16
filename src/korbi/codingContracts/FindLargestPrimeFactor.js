import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, findLargestPrimeFactor)
}

function findLargestPrimeFactor(n) {
    let maxFactor = 1;
    let divisor = 2;
    
    while (n >= 2) {
        if (n % divisor == 0) {
            maxFactor = Math.max(maxFactor, divisor)
            n = n / divisor;
        } else {
            divisor++;
        }
    }
	return maxFactor
}