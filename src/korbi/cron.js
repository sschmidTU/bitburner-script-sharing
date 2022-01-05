/** @param {NS} ns **/
export async function main(ns) {
	ns.tail()
	ns.disableLog("sleep")
	await cron(ns)
}

async function cron(ns) {
	let table = JSON.parse(ns.read("cron.txt"))
	for (const script in table) {
		table[script] = 0
	}
	let time = 0
	while (true) {
		for (const script in table) {
			if (time > table[script]) {
				if (ns.run(script, 1, ...ns.args) != 0) {
					table[script] = time + JSON.parse(ns.read("cron.txt"))[script]
					break
				}
			}
		}
		const options = JSON.parse(ns.read("options.script"))
		await ns.sleep(options.cronSleep)
		time += options.cronSleep / 1000
	}
}