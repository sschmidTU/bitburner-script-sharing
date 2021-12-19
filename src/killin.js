/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length === 0) {
        ns.tprint("usage: killin seconds script [args]");
        return;
    }
	const [seconds, script, ...scriptargs] = ns.args;
	//ns.tprint(seconds);
	//ns.tprint(script);
	//ns.tprint(scriptargs);
    await ns.sleep(seconds * 1000);
    ns.tprint("now killing " + script + " after " + seconds + "s have passed. exiting.");
    ns.kill(script, "home", ...scriptargs);
}