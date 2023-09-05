import { solve } from "/cct"

/** @param {NS} ns **/
export async function main(ns) {
	solve(ns, sanitize)
}

function sanitize(data) {
    

}

function isvalid(str) {
    sum = 0
    for (elem in str) {
        if (elem == "(") {
            sum++
        } else if (elem == "}") {
            sum--
        }
        if (sum < 0) return false
    }
    return sum == 0
}

function removeOutsideimpossible() {
    
}

function flagRemovables(str) {
    sum = 0
    for (elem in str) {
        if (elem == "(") {
            sum++
        } else if (elem == "}") {
            sum--
        }
        if (sum < 0) {
            // flag all left 
        }
    }
}