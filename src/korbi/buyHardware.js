import { getServerList } from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
    if (!isRequired(ns)) {
        ns.print("No new server needed!")
        return
    }
    ns.disableLog("getServerMaxRam")
    const options = JSON.parse(ns.read("options.txt"))
    let [lastBoughtRam, nLastBought] = getLargestPurchasedServerRam(ns)
    const serverLimit = ns.getPurchasedServerLimit()
    const servers = ns.getPurchasedServers()
    ns.print("Number of servers: " + servers.length)
    ns.print("LastBoughtRam: " + lastBoughtRam + " (" + nLastBought + ")")
    const money = ns.getServerMoneyAvailable("home") - options.keepMoney
    const ram = getMaxPayableServer(ns, money)
    if (ram >= lastBoughtRam) {
        if (ram == lastBoughtRam && nLastBought >= options.maxServersPerSize) return
        if (servers.length == serverLimit) {
            const [smallest, smallestSize] = findSmallestServer(ns, servers)
            if (smallestSize < ram) {
                await deleteServer(ns, smallest)
            } else {
                return
            }
        }

        ns.tprint("Buying: " + ram + " for " + (ns.getPurchasedServerCost(ram) / 1e6).toFixed(0) + "M")
        ns.purchaseServer("-", ram)
        if (ram > lastBoughtRam) {
            lastBoughtRam = ram
        }
    }
}

async function deleteServer(ns, server) {
    ns.killall(server)
    await ns.sleep(2000)
    ns.deleteServer(server)
}

function findSmallestServer(ns, servers) {
    let smallest = servers[0]
    let smallestSize = ns.getServerMaxRam(smallest)
    for (const s of servers) {
        const sram = ns.getServerMaxRam(s)
        if (sram < smallestSize) {
            smallestSize = sram
            smallest = s
        }
    }
    return [smallest, smallestSize]
}

function getMaxPayableServer(ns, money) {
    let serverRam = ns.getPurchasedServerMaxRam()
    ns.print("max ram:" + serverRam)
    while (ns.getPurchasedServerCost(serverRam) > money) {
        serverRam /= 2
        if (serverRam <= 4) { // don't by very small servers
            return 0
        }
    }
    ns.print("buyable ram: " + serverRam + " for " + (ns.getPurchasedServerCost(serverRam) / 1e6).toFixed(0) + "M")
    return serverRam
}

function getLargestPurchasedServerRam(ns) {
    let maxRam = 0
    let num = 0
    for (const s of ns.getPurchasedServers()) {
        const ram = ns.getServerMaxRam(s)
        if (ram == maxRam) {
            num++
        }
        if (ram > maxRam) {
            maxRam = ram
            num = 1
        }
    }
    return [maxRam, num]
}

function isRequired(ns) {
    let usedRam = 0
    let totalRam = 0
    for (const server of getServerList(ns)) {
        totalRam += ns.getServerMaxRam(server)
        usedRam += ns.getServerUsedRam(server)
    }
    ns.tprint(usedRam + " of " + totalRam)
    return usedRam > totalRam / 2
}