/** @param {NS} ns **/
export async function main(ns) {
	const [script, n, time, ...args] = ns.args
	ns.tprint(script + " " + n + " " + time + " " + args.join(" "))
	for (let i = 0; i < n; i++) {
		ns.run(script, 1, ...args)
		if (i < n - 1)
			await ns.sleep(time)
	}
}