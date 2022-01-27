/** @param {import(".").NS} ns **/
export async function main(ns) {
    ns.tail()
    while (true) { 
        const time = task(ns)
        await ns.sleep(time + 200)
    }
}
/** @param {import(".").NS} ns **/
function task(ns) {
    levelUpSkills(ns)
    let [type, action] = getHighestValueContract(ns)
    if (moveToCity(ns)) {
        type = "general"
        action = "field analysis"
    } else if (needStamina(ns, type, action)) {
        type = "general"
        action = "Training"
    }
    ns.bladeburner.startAction(type, action)
    return ns.bladeburner.getActionTime(type, action)
}

function levelUpSkills(ns) {
    const b = ns.bladeburner
    for (const skill of b.getSkillNames()) {
        if (b.getSkillUpgradeCost(skill) < b.getSkillPoints())
            b.upgradeSkill(skill)
    }
}

function moveToCity(ns) {
    const b = ns.bladeburner
    const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"]
    cities.sort((i,j) => b.getCityChaos(i) - b.getCityChaos(j))
    const bestCity = cities.filter(c => b.getCityCommunities(c) > 0)[0]
    if (b.getCityChaos(bestCity) + 2 < b.getCityChaos(b.getCity())) {
        b.switchCity(bestCity)
        return true
    }
    return false
}

/** @param {import(".").NS} ns **/
export function getHighestValueContract(ns) {
    const contracts = ns.bladeburner.getContractNames().map(c => ["contracts", c])
    const operations = ns.bladeburner.getOperationNames().map(o => ["operations", o])
    const actions = contracts.concat(operations)
    const val = a => valueOfAction(ns, a[0], a[1])
    const sorted = actions
        .filter(a => ns.bladeburner.getActionCountRemaining(a[0], a[1]) >= 5)
        .sort((a, b) => val(b) - val(a))
    ns.print(sorted.map(a => [a[1], valueOfAction(ns, a[0], a[1])]))
    ns.print(sorted.map(a => [a[1], getSuccesChance(ns, a[0], a[1])]))
    return sorted[0]
}



function valueOfAction(ns, type, action) {
    return Math.pow(getSuccesChance(ns, type, action), 3) * ns.bladeburner.getActionRepGain(type, action) / ns.bladeburner.getActionTime(type, action)
}

function getSuccesChance(ns, type, action) {
    const chance = ns.bladeburner.getActionEstimatedSuccessChance(type, action)
    return (3 * chance[0] + chance[1]) / 4
}

function needStamina(ns, type, action) {
    const [stamina, maxStamina] = ns.bladeburner.getStamina()
    const lowStamina = stamina < 2 + maxStamina / 2
    return lowStamina && getSuccesChance(ns, type, action) < 0.9
}