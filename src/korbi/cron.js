/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep")
	ns.tail()
	await cron(ns)
}

async function cron(ns) {
	let table = JSON.parse(ns.read("cron.txt"))
	for (const script in table) {
		table[script] = 0
	}
	let time = 0
	while (true) {
		const options = JSON.parse(ns.read("options.script"))
		for (const script in table) {
			if (time > table[script]) {
				let host = options.host
				if (options.homeScripts.includes(script)) {
					host = "home"
				}
				if (host != "home") {
					await ns.scp(script, "home", options.host)
				}
				if (ns.exec(script, host, 1, ...ns.args) != 0) {
					table[script] = time + JSON.parse(ns.read("cron.txt"))[script]
					break
				}
			}
		}
		
		await ns.sleep(options.cronSleep)
		time += options.cronSleep / 1000
	}
}