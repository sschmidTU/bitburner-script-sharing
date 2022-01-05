/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args[0] || ns.getPlayer().crimeType !== "") return
	ns.commitCrime(bestCrime(ns))
}

function sortedCrimes(ns) {
	let crimes = ["shoplift", "rob store", "mug someone", "larceny", "deal drugs",
		"bond forgery", "trafficking illegal arms", "homicide", "grand theft auto",
		"kidnap and ransom", "assassinate", "heist"]
	crimes.sort((a, b) => crimeBenefit(ns, b) - crimeBenefit(ns, a))
	return crimes
}

export function bestCrime(ns) {
	return sortedCrimes(ns)[0]
}

function crimeBenefit(ns, crime) {
	let crimeSum = 0
	const options = JSON.parse(ns.read("options.txt"))
	const requiredStats = JSON.parse(ns.read("required_stats.txt"))
	const crimeStats = ns.getCrimeStats(crime)
	const stats = ["agility", "dexterity", "strength", "defense", "charisma", "hacking"]
	for (const stat of stats) {
		crimeSum += crimeStats[stat + "_exp"] * (1 + crimeStats[stat + "_success_weight"]) * options[stat + "_weight"] * requiredStats[stat] / ns.getPlayer()[stat]
	}
	crimeSum += options.karma_weight * crimeStats.karma
	crimeSum += options.kill_weight * crimeStats.kills * requiredStats.kills / (ns.getPlayer().numPeopleKilled + 1)
	crimeSum += options.money_weight * crimeStats.money / ns.getPlayer().money
	crimeSum *= ns.getCrimeChance(crime)
	crimeSum /= crimeStats.time
	return crimeSum
}