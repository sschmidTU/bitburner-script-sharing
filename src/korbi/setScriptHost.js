import { copyTo } from "./copyScriptsTo"
import { getOptions, updateOptions } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
    let currentHost = getOptions(ns).host
    if (ns.getServerMaxRam("home") > 1024) {
        if (currentHost !== "home")
            return await setHost(ns, "home")
        return
    }
    try {
        var hostRam = ns.getServerMaxRam(currentHost)
    } catch (err) {
        return await setHost(ns, "home")
    }
    if (hostRam < 1024 || ns.args[0] == "set") {
        const newHost = findMaxRamHost(ns, currentHost, hostRam)
        if (currentHost != newHost || ns.args[0] == "set") {
            await setHost(ns, newHost)        
        }
    }
}

async function setHost(ns, host) {
    ns.tprint("New host: " + host)
    await updateOptions(ns, "host", host)
    await copyTo(ns, host)
}

function findMaxRamHost(ns, currentHost, currentRam) {
    let maxRam = currentRam
    let maxHost = currentHost
    for (const s of ns.getPurchasedServers()) {
        const ram = ns.getServerMaxRam(s)
        if (ram > maxRam) {
            maxRam = ram
            maxHost = s
        }
    }
    ns.tprint("MaxRam Server " + maxHost + " has " + maxRam + " GB ram")
    return maxHost
}