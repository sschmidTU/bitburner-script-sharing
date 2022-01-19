import { copyTo } from "./copyScriptsTo"
import { getOptions, updateOptions } from "./utilities"
/** @param {NS} ns **/
export async function main(ns) {
    let options = getOptions(ns)
    if (ns.getServerMaxRam("home") > 1024) {
        if (options.host !== "home")
            return await setHost(ns, "home")
    }
    try {
        var hostRam = ns.getServerMaxRam(options.host)
    } catch (err) {
        return await setHost(ns, options, "home")
    }
    if (hostRam < 1024 || ns.args[0] == "set") {
        const newHost = findMaxRamHost(ns, options.host, hostRam)
        if (options.host != newHost || ns.args[0] == "set") {
            await setHost(ns, options, newHost)        
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