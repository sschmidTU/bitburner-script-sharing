/** @param {NS} ns **/
export function getServerList(ns, excludeServers = ["home"]) {
	var l = ns.scan('home')
	var final = []
	let cnt = 0
	while (!l.length == 0 && cnt++ < 1000) {
		var item = l.pop()
		if (ns.hasRootAccess(item)) {
			final.push(item)
		} else {
			if (isRootable(ns, item)) {
				ns.print("Rooting: " + item)
				ns.run("root.js", 1, item)
			}
		}
		const s2 = ns.scan(item)
		for (const s of s2) {
			if (!excludeServers.includes(s) && !final.includes(s) && !l.includes(s) && ns.hasRootAccess(item)) {
				l.push(s)
			}
		}
	}
	return final.filter(s => !excludeServers.includes(s))
}

export function getNumberOfRunningScripts(ns, server, script) {
	let num = 0
	for (const running of ns.ps(server)) {
		if (running.filename == script) {
			num++
		}
	}
	return num
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
	let num = 0
	for (const name of getCrackNames()) {
		if (exists(ns, name)) {
			num += 1
		}
	}
	return num
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
		if (s === target) {
			return [s]
		}
		if (s !== backConnect) {
			const pth = getConnectionPath(ns, target, s, start)
			if (pth) {
				return [s, ...pth]
			}
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

export async function writeOptions(ns, options) {
	await ns.write("options.script", JSON.stringify(options, null, 2), "w")
}
