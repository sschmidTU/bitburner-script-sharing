import { performTask } from "singularity.js"
/** @param {NS} ns **/
export async function main(ns) {
    const options = JSON.parse(ns.read("options.script"))
    performTask(ns, options)
}