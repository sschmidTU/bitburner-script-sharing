/** @param {NS} ns **/
export async function main(ns) {
	const time = Number(ns.read("min_weaken_time.txt"))
	const loopTime = Math.floor((time + 400) / 200) * 100
	let options = JSON.parse(ns.read("options.script"))
	options.scheduleLoopTime = loopTime
	await ns.write("options.script", JSON.stringify(options, null, 2), "w")
}