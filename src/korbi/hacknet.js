/** @param {NS} ns **/

import { getFile, getOptions, writeFile } from "./utilities"

export async function main(ns) {
	const h = ns.hacknet
	const options = getOptions(ns)
	const money = ns.getPlayer().money
	const maxPrice = Math.min(options.maxHacknetCost * money, money - options.keepMoney)
	const [doUpgrade, node, cost] = await getMostEffectiveItem(ns)// getCheapestItem(h)
	if (cost * options.money_weight < maxPrice)
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

async function getMostEffectiveItem(ns) {
	const h = ns.hacknet
	const file = "hacknet_gain.txt"
	const dict = getFile(ns, file)
	const doUpgrade = [h.upgradeLevel, h.upgradeRam, h.upgradeCore]
	const upgradeCost = [h.getLevelUpgradeCost, h.getRamUpgradeCost, h.getCoreUpgradeCost]
	
	let bestNode = -1
	let shortestTime = h.getPurchaseNodeCost() / lowestNodeGain(ns, dict)
	let bestItem = h.purchaseNode
	let bestCost = h.getPurchaseNodeCost()
	for (let node = 0; node < h.numNodes(); node++) {
		for (let i = 0; i < doUpgrade.length; i++) {
			const cost = upgradeCost[i](node, 1)
			const increase = calculateIncrease(ns, dict, node, doUpgrade[i])
			const equalTime = cost / increase
			if (equalTime < shortestTime) {
				shortestTime = equalTime
				bestNode = node
				bestItem = doUpgrade[i]
				bestCost = cost
			}
		}
	}

	await writeFile(ns, file, dict)
	return [bestItem, bestNode, bestCost] 
}

function lowestNodeGain(ns, dict) {
	const h = ns.hacknet
	let maxGain = Infinity
	for (let node = 0; node < h.numNodes(); node++) {
		const g = gain(ns, dict, h.getNodeStats(node))
		if (g < maxGain)
			maxGain = g
	}
	return maxGain
}

function calculateIncrease(ns, dict, node, upgradeItem) {
	const h = ns.hacknet
	let stats = h.getNodeStats(node)
	const currentGain = gain(ns, dict, stats)
	switch (upgradeItem) {
		case (h.upgradeLevel):
			stats.level += 1
			break
		case (h.upgradeRam):
			stats.ram += 1
			break
		case (h.upgradeCore):
			stats.cores += 1
			break
	}
	const upgradedGain = gain(ns, dict, stats)
	if (currentGain == -1 || upgradedGain == -1) return -1
	return (upgradedGain - currentGain) * ns.getPlayer().hacknet_node_money_mult
}

function gain(ns, dict, stats) {
	const key = stats.level + "_" + stats.ram + "_" + stats.cores
	if (key in dict)
		return dict[key]
	if (!hasFormulasAccess(ns)) {
		return -1
	}
	const val = ns.formulas.hacknetNodes.moneyGainRate(stats.level, stats.ram, stats.cores)
	dict[key] = val
	return val
}

function hasFormulasAccess(ns) {
	return ns.fileExists("Formulas.exe")
}

function upgradeCost(ns, node, item) {
	const h = ns.hacknet
	const upgradeItems = [h.getLevelUpgradeCost, h.getRamUpgradeCost, h.getCoreUpgradeCost]
	const doUpgradeItems = [h.upgradeLevel, h.upgradeRam, h.upgradeCore, h.purchaseNode]
	for (let i = 0; i < upgradeItems.length; i++) {
		if (item === doUpgradeItems[i]) {
			return upgradeItems[i](node, 1)
		}
	}
	return h.getPurchaseNodeCost()
}