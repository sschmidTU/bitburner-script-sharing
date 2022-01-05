/** @param {NS} ns **/
export async function main(ns) {
    upgradeHome(ns)
}

function upgradeHome(ns) {
	if (ns.getPlayer().money > ns.getUpgradeHomeRamCost()) {
		ns.upgradeHomeRam()
	}
	if (ns.getPlayer().money > ns.getUpgradeHomeCoresCost()) {
		ns.upgradeHomeCores()
	}
	return false
}