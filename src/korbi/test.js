import { getServerList, isHackable, isRootable } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
	//ns.print(ns.ls("home"))
	//ns.print(ns.getPurchasedServerCost(256))
	//ns.print(ns.fileExists("codingContracts/SpiralizeMatrix.js"))
	ns.print(ns.getCrimeStats("ultimate heist").money / 1e6)
	//ns.print(ns["hack"]("n00dles"))
	//ns.print(ns.read("tasks.txt"))
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
	//ns.print(ns.getWeakenTime("n00dles"))
	//ns.tprint(ns.getHackTime(ns .args[0]))
	//ns.tprint(ns.getOwnedAugmentations(true).length)
	//ns.print(ns.read("servers_money_factor.txt"))
	//ns.print(ns.read("servers_hack_xp.txt"))
	//ns.print(ns.read("servers_hack_factor.txt"))
	//ns.run("watchServer.js", 1, "n00dles")
	//ns.run("watchServer.js", 1, "foodnstuff")
	//ns.run("watchServer.js", 1, "harakiri-sushi")
	//ns.print(getServerList(ns).filter(s => isRootable(ns, s)))
	
}

async function printHost(ns, script) {
	const options = JSON.parse(ns.read("options.script"))
	await ns.scp(script, options.host, "home")
	ns.print(ns.read(script))
}