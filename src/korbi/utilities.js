/** @param {NS} ns **/

export function getServerList(ns, excludeServers=["home"]) {
	let list = ns.scan("home")
	let final = []
	while (list.length > 0) {
		const item = list.pop()
		final.push(item)
		if (!ns.hasRootAccess(item) && isRootable(ns, item))
			ns.run("root.js", 1, item)

		for (const s of ns.scan(item)) {
			if (!final.includes(s) && !list.includes(s))
				list.push(s)
		}
	}
	return final.filter(ns.hasRootAccess).filter(s => !excludeServers.includes(s))
}

export function getNumberOfRunningScripts(ns, server, script) {
	return ns.ps(server).filter(p => p.filename == script).length
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
	return getCrackNames().filter(n => exists(ns, n)).length
}

export function isRootable(ns, server) {
	return getNumCracks(ns) >= ns.getServerNumPortsRequired(server)
}

export function isHackable(ns, server) {
	return ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel()
}

export function isSecure(ns, server, options) {
	return ns.getServerSecurityLevel(server) < options.securityThreshold * ns.getServerMinSecurityLevel(server)
}

export function exists(ns, file) {
	return ns.fileExists("/" + file)
}

export function getConnectionPath(ns, target, start="home", backConnect="") {
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
		ns.connect(server)
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
	return getFile(ns, "required_stats.txt")
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
