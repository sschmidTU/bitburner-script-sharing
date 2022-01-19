import { getMinStat } from "./gym"
import { getFile, getInstitutions, getOptions } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
    await joinFaction(ns)
}

async function joinFaction(ns) {
    const options = getOptions(ns)
    const factionGroups = getFile(ns, "faction-groups.script")
    const syndicates = getInstitutions(ns).syndicates
    const g = options.factionGroup
    const excluded = factionGroups[String(g % 3 + 1)].concat(factionGroups[String((g + 1) % 3 + 1)])
    const player = ns.getPlayer()
    for (const faction of ns.checkFactionInvitations()) {
        if (!excluded.includes(faction)) {
            ns.joinFaction(faction)
            await ns.sleep(1000)
        }
    }
    for (const faction of factionGroups[g]) {
        if (player.money > options.minMoneyForFactionTravel && !player.factions.includes(faction)) {
            ns.travelToCity(faction)
        }
    }
    if (getMinStat(ns) == "" && player.numPeopleKilled > 30) { // all stats enough trained
        for (const faction of syndicates) {
            if (!player.factions.includes(faction)) {
                if (["Tetrads", "The Dark Army"].includes(faction)) {
                    ns.travelToCity("Chongqing")
                } else if (faction == "The Syndicate") {
                    ns.travelToCity("Sector-12")
                }
                await ns.sleep(2000)
            }
        }
    }
}