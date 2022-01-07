import { exists, execute } from "utilities.js"
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

		for (let time = 0; time < 10000; time += 1000) {
			const info = ns.readPort(1)
			if (info !== "NULL PORT DATA") {
				ns.print("Result: " + info)
				break
			}
			await ns.sleep(1000)
		}
	} else {
		ns.tail()
		ns.print("Need solver: " + contractSolver + " for " + filename + " " + server)

		const description = ns.codingcontract.getDescription(filename, server)
		ns.print(description)
	}
}