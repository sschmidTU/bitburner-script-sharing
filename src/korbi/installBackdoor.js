import { connect } from "./utilities"

/** @param {NS} ns **/
export async function main(ns) {
    await installBackdoor(ns, ns.args[0])
}

async function installBackdoor(ns, server) {
    ns.tprint("Installing backdoor: " + server)
    connect(ns, server)
    await ns.singularity.installBackdoor(server)
    connect(ns, "home")
    await ns.write("backdoors.txt", "\n" + server)
    return false
}
