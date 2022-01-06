/** @param {NS} ns **/
export async function main(ns) {
	const options = JSON.parse(ns.read("options.script"))
	const availableRam = ns.getServerMaxRam(options.host)
	let opts = {}
	let scripts = {}
	// default
	opts.keepRamHome = 15
	opts.money_weight = 1
	opts.onlyGrowThreshold = 0.1
	opts.levelUpHack = true
	opts.maxHacknetCost = 0.01
	opts.cronSleep = 700
	opts.maxWeakenTargets = 5
	opts.hackPercent = 0.9
	opts.workOnProgram = 1000
	opts.buyProgramThreshold = 1
	scripts["joinFaction"] = 30
	scripts.crime = false
	scripts["createProgram"] = false
	scripts.estimateHackXp = 500
	scripts.taskValue = 50
	scripts.singularity = 20
	scripts.upgradeHome = 50
	if (availableRam < 512) {
		scripts.singularity = false
		scripts["createProgram"] = 20
		scripts.crime = 3
	}
	if (availableRam == 32) {
		opts.maxWeakenTargets = 0
		opts.levelUpHack = false
		opts.hackPercent = 0.1
		opts.workOnProgram = 0.01
		opts.buyProgramThreshold = 0.1
	}
	else if (availableRam == 64) {
		opts.maxWeakenTargets = 1
		opts.hackPercent = 0.2
		opts.workOnProgram = 0.1
		opts.buyProgramThreshold = 0.5
	}
	else if (availableRam == 128) {
		opts.maxWeakenTargets = 2
		opts.hackPercent = 0.3
		opts.workOnProgram = 0.5
		opts.buyProgramThreshold = 0.5
	}
	else if (availableRam == 256) {
		opts.maxWeakenTargets = 3
		opts.hackPercent = 0.5
		opts.workOnProgram = 1
		opts.buyProgramThreshold = 1
	}
	const isNew = await setOptions(ns, opts, scripts, availableRam)
	if (isNew && ns.args[0] != "set") {
		ns.tprint("Killing and restarting cron")
		ns.scriptKill("cron.js", "home")
		ns.spawn("cron.js", 1, ...ns.args)
	}
}

async function setOptions(ns, opts, scripts, availableRam) {
	let options = JSON.parse(ns.read("options.script"))
	const condition1 = (options.hostRam > 1024 && availableRam > 1024)
	const condition2 = options.hostRam == availableRam
	const alwaysUpdate = ns.args[0] == "set"
	if (!alwaysUpdate && (condition1 || condition2)) return false
	options.hostRam = availableRam

	let cron = JSON.parse(ns.read("cron.txt"))
	let maxRamRequired = 12
	for (const script in scripts) {
		const ramReq = ns.getScriptRam(script+".js")
		if (ramReq < availableRam && scripts[script]) {
			cron[script+".js"] = scripts[script]
			if (ramReq > maxRamRequired) {
				maxRamRequired = ramReq
			}
		} else {
			delete cron[script+".js"]
		}
	}
	await ns.write("cron.txt", JSON.stringify(cron, null, 2), "w")
	options.keepRam = maxRamRequired
	for (const opt in opts) {
		options[opt] = opts[opt]
	}
	await ns.write("options.script", JSON.stringify(options, null, 2), "w")
	await ns.scp("options.script", "home", options.host)
	
	return true
}