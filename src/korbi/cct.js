import { exists } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
	const [filename, server] = ns.args
	const contractType = ns.codingcontract.getContractType(filename, server).replace(/\s+/g, '')
	ns.print("Type: " + contractType)
	const contractSolver = `codingContracts/${contractType}.js`
	ns.print(contractSolver)
	if (exists(ns, contractSolver)) {
		ns.print("Running Solver: " + contractSolver)
		ns.run(contractSolver, 1, filename, server)
	} else {
		ns.tail()
		ns.print("Need solver: " + contractSolver + " for " + filename + " " + server)

		const description = ns.codingcontract.getDescription(filename, server)
		ns.print(description)
	}
}

export function solve(ns, func, test=false) {
	ns.tail()
    const filename = ns.args[0]
	const server = ns.args[1]
	const data = ns.codingcontract.getData(filename, server)
	const solution = func(data, ns)
	ns.print("Solution: " + solution)
	if (!test) {
		const result = ns.codingcontract.attempt(solution, filename, server)
		ns.print("Result: " + result)
		if (!result) {
			ns.print(filename + " is wrong!!")
			ns.write(filename + ".txt", data)
		}
	}
}
