import {connect} from "utilities.js"
/** @param {NS} ns **/
export async function main(ns) {
	connect(ns, ns.args[0])
}