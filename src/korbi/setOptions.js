/** @param {NS} ns **/
export async function main(ns) {
	let opts = {}
	let scripts = {}
	// default
	opts.money_weight = 1
	opts.onlyGrowThreshold = 0.25
	opts.keepRamHome = 135
	scripts.joinFaction = 30
	scripts.singularity = 20
	scripts.crime = false
	scripts.createProgram = false
	scripts.estimateHackXp = 500
	scripts.taskValue = 50
	const homeram = ns.getServerMaxRam("home")
	if (homeram == 32) {
		opts.maxWeakenTargets = 0
		opts.keepRamHome = 17
		opts.levelUpHack = false
		opts.hackPercent = 0.1
		opts.workOnProgram = 0.01
		opts.buyProgramThreshold = 0.1	
		opts.money_weight = 100
		scripts.estimateHackXp = false
		scripts.singularity = false
		scripts.crime = 3
		scripts.createProgram = 20
		scripts.joinFaction = false
		scripts.taskValue = false
	}
	else if (homeram == 64) {
		opts.maxWeakenTargets = 1
		opts.keepRamHome = 17
		opts.levelUpHack = true
		opts.hackPercent = 0.2
		opts.workOnProgram = 0.1
		opts.buyProgramThreshold = 0.5
		opts.money_weight = 10
		scripts.estimateHackXp = 1000
		scripts.singularity = false
		scripts.taskValue = false
		scripts.crime = 3
		scripts.createProgram = 20
	}
	else if (homeram == 128) {
		opts.maxWeakenTargets = 0
		opts.keepRamHome = 105
		opts.levelUpHack = false
		opts.hackPercent = 0.3
		opts.workOnProgram = 0.5
		opts.buyProgramThreshold = 0.5
		scripts.estimateHackXp = false
	}
	else if (homeram > 128 && homeram < 1024) {
		opts.maxWeakenTargets = 3
		opts.keepRamHome = 135
		opts.levelUpHack = true
		opts.hackPercent = 0.5
		opts.workOnProgram = 1
		opts.buyProgramThreshold = 1
	}
	else {
		opts.maxWeakenTargets = 5
		opts.levelUpHack = true
		opts.hackPercent = 0.9
		opts.onlyGrowThreshold = 0.1
		opts.workOnProgram = 1000
		opts.buyProgramThreshold = 1
	}
	const isNew = await setOptions(ns, opts, scripts, homeram)
	if (isNew) {
		ns.tprint("Killing and restarting cron")
		ns.scriptKill("cron.js", "home")
		ns.spawn("cron.js", 1, ...ns.args)
	}
}

async function setOptions(ns, opts, scripts, homeram) {
	let options = JSON.parse(ns.read("options.txt"))
	const condition1 = (options.homeram > 1024 && homeram > 1024)
	const condition2 = options.homeram == homeram
	if (condition1 || condition2) return false 
	options.homeram = homeram
	for (const opt in opts) {
		options[opt] = opts[opt]
	}
	await ns.write("options.txt", JSON.stringify(options, null, 2), "w")
	let cron = JSON.parse(ns.read("cron.txt"))
	for (const script in scripts) {
		if (scripts[script]) {
			cron[script+".js"] = scripts[script]
		} else {
			delete cron[script+".js"]
		}
	}
	await ns.write("cron.txt", JSON.stringify(cron, null, 2), "w")
	return true
}