import { getServerList } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
	//ns.print(ns.ls("home"))
	//ns.print(ns.getPurchasedServerCost(256))
	//ns.print(ns.fileExists("codingContracts/SpiralizeMatrix.js"))
	//ns.print(ns.getCrimeStats("homicide").money)
	//ns.print(ns["hack"]("n00dles"))
	ns.print(ns.read("tasks.txt"))
	//ns.print(ns.read("options.script"))
	//await printHost(ns, "required_stats.script")
    //ns.print(ns.args[0])
    //ns.print(ns.args[1])
	//ns.travelToCity("Sector-12")
	//ns.gymWorkout("powerhouse gym", "agility")
	//console.dir(ns.getPlayer())
	//await ns.sleep(10000)
	//console.dir(ns.getPlayer())
	//ns.applyToCompany("KuaiGong International", "software")
	//ns.workForCompany("KuaiGong International", "software")
	//ns.tprint(getServerList(ns))
	//ns.tprint(ns.getFactionFavorGain("Fulcrum Secret Technologies"))
	//ns.tprint(ns.getWeakenTime(ns.args[0]))
	//ns.tprint(ns.getHackTime(ns .args[0]))
	//ns.tprint(ns.getOwnedAugmentations(true).length)
	
}

async function printHost(ns, script) {
	const options = JSON.parse(ns.read("options.script"))
	await ns.scp(script, options.host, "home")
	ns.print(ns.read(script))
}