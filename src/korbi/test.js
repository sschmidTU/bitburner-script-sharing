import { getServerList } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
    ns.print(ns.read("servers_money_factor.txt"))
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