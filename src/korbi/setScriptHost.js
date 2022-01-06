import { copyTo } from "./copyScriptsTo"
/** @param {NS} ns **/
export async function main(ns) {
    let options = JSON.parse(ns.read("options.script"))
    const hostRam = ns.getServerMaxRam(options.host)
    if (hostRam < 1024 || ns.args[0] == "set") {
        const newHost = findMaxRamHost(ns, options.host, hostRam)
        if (options.host != newHost || ns.args[0] == "set") {
            ns.tprint("New host: " + newHost)
            ns.killall(newHost)
            await copyTo(ns, newHost)
            options.host = newHost
            await ns.write("options.script", JSON.stringify(options, null, 2), "w")
        }
    }
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