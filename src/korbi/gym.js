/** @param {NS} ns **/
export async function main(ns) {
	gymWorkout(ns)
}

export function gymWorkout(ns) {
	if (ns.args[0]) return false
	if (ns.getPlayer().money < 10e6) return false

	const statsRate = s => `work${s[0].toUpperCase()}${s[1]}${s[2]}ExpGainRate`
	const institutions = JSON.parse(ns.read("institutions.script"))
	const gyms = institutions.gyms
	const unis = institutions.unis

	const minStat = getMinStat(ns)
	if (minStat === "") return false

	workout(ns, minStat)
	
	return true
	/*
	let gymXp = 0
	for (const gym of gyms) {
		ns.gymWorkout(gym, minStat)
		ns.sleep(1000)
		const rate = ns.getPlayer()[statsRate(minStat)]
		if (rate > gymXp) {
			bestGym = gym
			gymXp = rate
		}
	}
	ns.gymWorkout(bestGym)
	*/
}

export function workout(ns, stat) {
	if (ns.getPlayer().money < 10e6) return false
	const bestGym = "powerhouse gym"
	const bestUni = "ZB Institute of Technology"

	let city = "Sector-12"
	if (stat === "charisma") {
		city = "Volhaven"
	}
	if (ns.getPlayer().city !== city) {
		ns.travelToCity(city)
	}

	if (stat === "charisma") {
		ns.universityCourse(bestUni, "leadership")
	} else {
		ns.gymWorkout(bestGym, stat)
	}
}

export function getMinStat(ns) {
	const stats = ["strength", "defense", "dexterity", "agility", "charisma"]
	const requiredLevels = JSON.parse(ns.read("required_stats.script"))
	let minStat = ""
	let minLevel = 1
	for (const stat of stats) {
		const lv = ns.getPlayer()[stat] / requiredLevels[stat]
		if (lv < minLevel) {
			minLevel = lv
			minStat = stat
		}
	}
	return minStat
}