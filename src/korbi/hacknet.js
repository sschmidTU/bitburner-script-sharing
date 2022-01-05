/** @param {NS} ns **/
export async function main(ns) {
	const h = ns.hacknet
	const options = JSON.parse(ns.read("options.txt"))
	const maxPrice = Math.min(options.maxHacknetCost * ns.getPlayer().money, ns.getServerMoneyAvailable("home") - options.keepMoney)
	const [doUpgrade, node, cost] = getCheapestItem(h)
	if (cost > maxPrice) return
	if (h.numNodes() < h.maxNumNodes() && h.getPurchaseNodeCost() < cost) {
		h.purchaseNode()
	} else {
		doUpgrade(node, 1)
	}
}

function getCheapestItem(h) {
	const upgradeItems = [h.getLevelUpgradeCost, h.getRamUpgradeCost, h.getCoreUpgradeCost]
	const doUpgradeItems = [h.upgradeLevel, h.upgradeRam, h.upgradeCore]
	let cheapestNode = -1
	let cheapestUpgradeType = 0
	let cheapestCost = Infinity
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