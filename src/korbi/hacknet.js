/** @param {NS} ns **/
export async function main(ns) {
	const h = ns.hacknet
	const options = JSON.parse(ns.read("options.script"))
	const maxPrice = Math.min(options.maxHacknetCost * ns.getPlayer().money, ns.getServerMoneyAvailable("home") - options.keepMoney)
	const [doUpgrade, node, cost] = getCheapestItem(h)
	if (cost < maxPrice)
		doUpgrade(node, 1)
}

function getCheapestItem(h) {
	const upgradeItems = [h.getLevelUpgradeCost, h.getRamUpgradeCost, h.getCoreUpgradeCost]
	const doUpgradeItems = [h.upgradeLevel, h.upgradeRam, h.upgradeCore, h.purchaseNode]
	let cheapestNode = -1
	let cheapestUpgradeType = 3
	let cheapestCost = h.getPurchaseNodeCost()
	for (let node = 0; node < h.numNodes(); node++) {
		for (let i = 0; i < upgradeItems.length; i++) {
			let cost = upgradeItems[i](node, 1)
			if (cost < cheapestCost) {
				cheapestNode = node
				cheapestUpgradeType = i
				cheapestCost = cost
			}
		}
	}
	return [doUpgradeItems[cheapestUpgradeType], cheapestNode, cheapestCost]
}