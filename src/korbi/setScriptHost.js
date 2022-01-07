import { copyTo } from "./copyScriptsTo"
/** @param {NS} ns **/
export async function main(ns) {
    let options = JSON.parse(ns.read("options.script"))
    if (ns.getServerMaxRam("home") > 1024) {
        if (options.host !== "home")
            return await setHost(ns, options, "home")
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

async function setHost(ns, options, host) {
    ns.tprint("New host: " + host)
    options.host = host
    await ns.write("options.script", JSON.stringify(options, null, 2), "w")
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