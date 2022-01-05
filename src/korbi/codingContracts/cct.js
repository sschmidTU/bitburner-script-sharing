import { exists } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
	const filename = ns.args[0]
	const server = ns.args[1]
	const contractType = ns.codingcontract.getContractType(filename, server).replace(/\s+/g, '')
	ns.tprint("Type: " + contractType)

	const contractSolver = `${contractType}.js`
	ns.tprint(contractSolver)
	if (exists(ns, contractSolver)) {
		ns.tprint("Running Solver: " + contractSolver)
		ns.spawn(contractSolver, 1, filename, server)

		for (let time = 0; time < 10000; time += 1000) {
			const info = ns.readPort(1)
			if (info !== "NULL PORT DATA") {
				ns.print("Result: " + info)
				break
			}
			await ns.sleep(1000)
		}
	} else {
		ns.tprint("Need solver: " + contractSolver + " for " + filename + " " + server)

		const description = ns.codingcontract.getDescription(filename, server)
		ns.tprint(description)
	}
}