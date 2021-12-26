/** @param {NS} ns **/
export async function main(ns) {
	let factions = ["CyberSec", "NiteSec", "The Black Hand", "BitRunners", "Chongqing",
		"Sector-12", "Netburners", "Tian Di Hui", "Tetrads", //"Slum Snakes",
		"Speakers for the Dead", "Daedalus", "The Dark Army"];
	//factions = factions.sort((fac1, fac2) => ns.getServerRequiredHackingLevel(fac1) - )
	if (ns.args[0] === "c") {
		ns.args[0] = "combat";
	}
	const t = { // enum not available in javascript
		combat: 0,
		hack: 1,
		crime: 2,
		general: 3,
		companyWork: 4
	};
	let typeChosen = t[ns.args[0]];
	const augsInfo = [
		{
			name: "Neuroreceptor Management Implant",
			skip: false,
			description: "makes focus unnecessary",
			type: t.hack
		},
		{
			name: "Neuregen Gene Modification",
			skip: false,
			description: "+40% hack xp",
			type: t.hack
		},
		{
			name: "Power Recirculation Core",
			skip: false,
			description: "Insane",
			type: t.hack
		},
		{
			name: "Unstable Circadian Modulator",
			skip: false,
			description: "random effects per aug loop, can be strong", //+15% hack, +100% hack xp once :O
			type: t.crime
		},
		{
			name: "The Shadow's Simulacrum",
			skip: false,
			description: "+15% rep",
			type: t.general
		},
		{
			name: "Bionic Spine",
			skip: true,
			type: t.combat
		},
		{
			name: "Bionic Legs",
			skip: true,
			type: t.combat
		},
		{
			name: "Graphene BrachiBlades Upgrade",
			skip: true,
			type: t.combat
		},
		{
			name: "HemoRecirculator",
			skip: true,
			type: t.combat
		},
		{
			name: "LuminCloaking-V1 Skin Implant",
			skip: true,
			type: t.combat
		},
		{
			name: "LuminCloaking-V2 Skin Implant",
			skip: true,
			type: t.combat
		},
		{
			name: "Bionic Arms",
			skip: true,
			type: t.combat
		},
		{
			name: "Augmented Targeting",
			skip: true,
			type: t.combat
		},
		{
			name: "Combat Rib",
			skip: true,
			type: t.combat
		},
		{
			name: "Graphene Bionic Arms Upgrade",
			skip: true,
			type: t.combat
		},
		{
			name: "Synthetic Heart",
			skip: true,
			type: t.combat
		},
		{
			name: "Synfibril Muscle",
			skip: true,
			type: t.combat
		},
		{
			name: "NEMEAN Subdermal Weave",
			skip: true,
			type: t.combat
		},
		{
			name: "Nanofiber Weave",
			skip: true,
			type: t.combat
		},
		{
			name: "Speech Processor Implant",
			skip: true,
			type: t.companyWork
		},
		{
			name: "Nuoptimal Nootropic Injector Implant",
			skip: true,
			type: t.companyWork
		},
		{
			name: "Speech Enhancement",
			skip: true,
			type: t.companyWork
		},
	];
	const augsOwned = ns.getOwnedAugmentations();
	for (const faction of factions) {
		ns.tprint("~~~~~~ " + faction + " ~~~~~");
		//ns.tprint("faction: " + faction);
		//ns.tprint("~~~~~~~~~~~");
		const augs = ns.getAugmentationsFromFaction(faction);
		for (const aug of augs) {
			let augInfo = undefined;
			let skip = false;
			for (const info of augsInfo) {
				if (aug.startsWith(info.name)) { // e.g. Combat Rib I / II / III
					augInfo = info;
					if (augInfo.skip && typeChosen !== augInfo.type) {
						skip = true;
					}
					break;
				}
			}
			if (skip) {
				continue;
			}
			if (!augsOwned.includes(aug)) {
				let description = augInfo?.description ?? ""; //"no description yet"
				description = `(${description})`;
				ns.tprint(`missing ${aug} ${description}`); // from ${faction}
			} else {
				//debug:
				//ns.tprint("got aug " + aug + " from " + faction);
			}
		}
	}
}