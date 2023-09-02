/** @param {NS} ns **/
export async function main(ns) {
	upgradeHome(ns)
}

function upgradeHome(ns) {
	if (ns.getPlayer().money > ns.singularity.getUpgradeHomeRamCost()) {
		ns.singularity.upgradeHomeRam()
	}
	if (ns.getPlayer().money > ns.singularity.getUpgradeHomeCoresCost()) {
		ns.singularity.upgradeHomeCores()
	}
	return false
}