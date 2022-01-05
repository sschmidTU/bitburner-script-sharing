/** @param {NS} ns **/
export async function main(ns) {
    const file = "run_script.script"
    const [script, ...args] = ns.read(file).split(" ")
    await ns.write(file, "", "w")
    if (script) {
        ns.run(script, 1, ...args)
    }
}