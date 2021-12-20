/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length < 2) {
        ns.tprint("usage: runin seconds script [args]");
        return;
    }
    const [seconds, script, ...scriptargs] = ns.args;
    await ns.sleep(seconds * 1000);
    ns.tprint("now running " + script + " after " + seconds + "s have passed. exiting.");
    ns.run(script, 1, ...scriptargs);
}