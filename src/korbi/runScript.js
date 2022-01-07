/** @param {NS} ns **/
export async function main(ns) {
    const file = "run_script.script"
    const [script, ...args] = ns.read(file).split("\n")[0].split(" ")
    if (script && ns.run(script, 1, ...args))
        await deleteFirstLine(ns, file)
}

async function deleteFirstLine(ns, file) {
    const toWrite = ns.read(file).split("\n").slice(1).join("\n")
    await ns.write(file, toWrite, "w")
}
