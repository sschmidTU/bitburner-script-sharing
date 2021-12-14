/** @param {NS} ns 
 * @author simon
 * **/
export async function main(ns) {
    ns.disableLog('ALL');

    let server = "joesguns";
    if (ns.args[0]) {
        server = ns.args[0];
    } else {
        ns.tprint("usage: run watchServer.js [server]");
        ns.tprint("using server " + server + " by default.");
    }
    
    let money = 0;
    while (true) {
        const newMoney = ns.getServerMoneyAvailable(server);
        if (newMoney !== money) { // only show money if it has changed
            let newMoneyPercent = newMoney / ns.getServerMaxMoney(server);
            newMoneyPercent *= 100;
            newMoneyPercent = newMoneyPercent.toFixed(1);

            ns.print(`${printTimeNow()} new money: ${Number(newMoney.toFixed(0)).toLocaleString()} (${newMoneyPercent}%)`);

            money = newMoney;
        }
        await ns.sleep(1000);
    }
}

function printTimeNow() {
    const nowDate = new Date(Date.now());
    return printTime(nowDate);
}

function printTime(date) {
    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return `${date.getHours()}:${minutes}`;
}