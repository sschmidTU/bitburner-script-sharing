/** @param {NS} ns **/

export function getAllServers(ns) {
	let list = ns.scan("home")
	let final = []
	while (list.length > 0) {
		const item = list.pop()
		final.push(item)
		for (const s of ns.scan(item)) {
			if (!final.includes(s) && !list.includes(s))
				list.push(s)
		}
	}
	for (const s of final) {
		if (!ns.hasRootAccess(s) && isRootable(ns, s))
			ns.run("root.js", 1, s)
	}
	return final
}

export function getPossibleMoneyTargets(ns) {
	return getPossibleTargets(ns).filter(s => ns.getServerMaxMoney(s) > 0)
}

export function getRootAccessServers(ns) {
	return getAllServers(ns).filter(ns.hasRootAccess)
}

export function getPossibleTargets(ns) {
	return getRootAccessServers(ns)
		.filter(s => s !== "home")
		.filter(s => !ns.getPurchasedServers().includes(s))
		.filter(s => isHackable(ns, s))
}

export function getNumberOfRunningScripts(ns, server, script) {
	return ns.ps(server).filter(p => p.filename == script).length
}

export function getServerThreads(ns, options, server) {
	let ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
	if (server === options.host)
		ram -= options.keepRam
	if (server === "home")
		ram -= options.keepRamHome
	return Math.floor(ram / options.ramPerThread)
}

export function sum(array) {
	let s = 0
	for (const item of array) {
		s += item
	}
	return s
}

export async function root(ns, server) {
	var num = ns.getServerNumPortsRequired(server)
	var progs = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject]
	for (var i = 0; i < num; i++) {
		await progs[i](server)
	}
	await ns.nuke(server)
}

export function getCrackNames() {
	return ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]
}

export function getNumCracks(ns) {
	return getCrackNames().filter(c => ns.fileExists(c)).length
}

export function isRootable(ns, server) {
	return getNumCracks(ns) >= ns.getServerNumPortsRequired(server)
}

export function isHackable(ns, server) {
	return ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
}

export function isSecure(ns, server, options) {
	return ns.getServerSecurityLevel(server) < options.securityThreshold * ns.getServerMinSecurityLevel(server)
}

export function exists(ns, file) {
	return ns.fileExists("/" + file)
}

export function getConnectionPath(ns, target, start = "home", backConnect = "") {
	for (const s of ns.scan(start)) {
		if (s === target) return [s]
		if (s !== backConnect) {
			const pth = getConnectionPath(ns, target, s, start)
			if (pth) return [s, ...pth]
		}
	}
}

export function connect(ns, target) {
	for (const server of getConnectionPath(ns, target)) {
		ns.singularity.connect(server)
	}
}

export async function execute(ns, script, host, ...args) {
	if (host != "home") {
		await ns.scp(script, "home", host)
		ns.exec(script, host, 1, ...args)
	}
}

export async function writeFile(ns, file, content) {
	await ns.write(file, JSON.stringify(content, null, 2), "w")
}

export async function writeOptions(ns, options) {
	await writeFile(ns, "options.script", options)
}

export function getOptions(ns) {
	return getFile(ns, "options.script")
}

export function getFile(ns, file) {
	return JSON.parse(ns.read(file))
}

export function getTasks(ns) {
	const obj = getFile(ns, "tasks.txt")
	if (!obj) return []
	return obj.tasks
}

export function getInstitutions(ns) {
	return getFile(ns, "institutions.script")
}

export function getServerXp(ns) {
	return getFile(ns, "servers_hack_xp.txt")
}

export function getGoals(ns) {
	return getFile(ns, "required_stats.script")
}

export function getServerMoneyFactor(ns) {
	return getFile(ns, "servers_money_factor.txt")
}

export async function writeServerMoney(ns, money) {
	await writeFile(ns, "servers_money_factor.txt", money)
}

export async function writeServerXp(ns, xp) {
	await writeFile(ns, "servers_hack_xp.txt", xp)
}

export async function updateOptions(ns, option, value) {
	let options = getOptions(ns)
	if (options[option] != value) {
		options[option] = value
		await writeOptions(ns, options)
	}
}

export function enoughRep(ns, augmentation, faction) {
	return ns.singularity.getAugmentationRepReq(augmentation) < ns.singularity.getFactionRep(faction)
}

export function getWantedAugmentationsFromFaction(ns, faction) {
	let augs = ns.singularity.getAugmentationsFromFaction(faction)
	ns.print(getOptions(ns).onlyHackingAugs)
	if (getOptions(ns).onlyHackingAugs)
		augs = augs.filter(a => isHackingAug(ns, a))
	return augs
}

export function getAllWantedAugmentationsFromOwnFactions(ns) {
	const ownedAugmentations = ns.singularity.getOwnedAugmentations(true)
	let augmentations = []
	for (const f of ns.getPlayer().factions) {
		for (const aug of getWantedAugmentationsFromFaction(ns, f)) {
			if (aug == "NeuroFlux Governor" || !ownedAugmentations.includes(aug)) {
				augmentations.push([aug, f])
			}
		}
	}
	return augmentations
}

export function isHackingAug(ns, augName) {
	const augStats = ns.singularity.getAugmentationstats(augName)
	let n = 0
	for (const stat in augStats) {
		n++
		if (stat.startsWith("hacking") || stat.startsWith("faction") || stat.startsWith("company")) {
			return true
		}
	}
	return n == 0 // if no stats, buy it
}

export function keepFocus(ns) {
	return ns.args[0]
}

export function isCriming(ns) {
	return ns.getPlayer().crimeType !== ""
}

export function needsWeakening(ns, options, server) {
	return ns.getServerSecurityLevel(server) > ns.getServerMinSecurityLevel(server) * options.securityThreshold
}

export function last(list) {
	return list.slice(-1)[0]
}

export function totalRam(ns) {
	return sum(getRootAccessServers(ns).map(ns.getServerMaxRam))
}

export function usableMoney(ns, options) {
	return ns.getPlayer().money - options.keepMoney
}