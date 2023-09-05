import { getOptions, totalRam, usableMoney } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("getServerMaxRam")

    const ram = getMaxPayableServer(ns)
    if (ram >= minimumRamToBuy(ns))
        await buyNewServer(ns, ram)
}

async function buyNewServer(ns, ram) {
    const servers = ns.getPurchasedServers()
    if (servers.length == ns.getPurchasedServerLimit())
        await deleteServer(ns, findSmallestServer(ns, servers))

    ns.tprint("Buying: " + ram + " for " + (ns.getPurchasedServerCost(ram) / 1e6).toFixed(0) + "M")
    ns.purchaseServer("-", ram)
}

async function deleteServer(ns, server) {
    ns.killall(server)
    await ns.sleep(2000)
    ns.deleteServer(server)
}

function findSmallestServer(ns, servers) {
    return servers.sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a))[0]
}

function getMaxPayableServer(ns) {
    const money = usableMoney(ns, getOptions(ns))
    let serverRam = ns.getPurchasedServerMaxRam()
    while (ns.getPurchasedServerCost(serverRam) > money && serverRam > 4) {
        serverRam /= 2
    }
    ns.print("buyable ram: " + serverRam + " for " + (ns.getPurchasedServerCost(serverRam) / 1e6).toFixed(0) + "M")
    return serverRam
}

function minimumRamToBuy(ns) {
    return totalRam(ns) / 2
}
