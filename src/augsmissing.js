/** @param {NS} ns **/
export async function main(ns) {
	let factions = ["CyberSec", "NiteSec", "The Black Hand", "BitRunners", "Chongqing",
		"Tian Di Hui", "Sector-12", "Tetrads",
		"Speakers for the Dead", "Daedalus"];
	//factions = factions.sort((fac1, fac2) => ns.getServerRequiredHackingLevel(fac1) - )
	const augsInfo = [
		{
			name: "Neuroreceptor Management Implant",
			skip: false,
			description: "makes focus unnecessary"
		},
		{
			name: "Neuregen Gene Modification",
			skip: false,
			description: "+40% hack xp"
		},
		{
			name: "Power Recirculation Core",
			skip: false,
			description: "Insane"
		},
		{
			name: "Unstable Circadian Modulator",
			skip: false,
			description: "+15% hack, +100% hack xp" 
		},
		{
			name: "The Shadow's Simulacrum",
			skip: false,
			description: "+15% rep"
		},
		{
			name: "Bionic Spine",
			skip: true
		},
		{
			name: "Bionic Legs",
			skip: true
		},
		{
			name: "Graphene BrachiBlades Upgrade",
			skip: true
		},
		{
			name: "HemoRecirculator",
			skip: true
		},
		{
			name: "LuminCloaking-V1 Skin Implant",
			skip: true
		},
		{
			name: "LuminCloaking-V2 Skin Implant",
			skip: true
		},
		{
			name: "Bionic Arms",
			skip: true
		},
		{
			name: "Augmented Targeting I",
			skip: true
		},
		{
			name: "Augmented Targeting II",
			skip: true
		},
		{
			name: "Synthetic Heart",
			skip: true
		},
		{
			name: "Synfibril Muscle",
			skip: true
		},
		{
			name: "NEMEAN Subdermal Weave",
			skip: true
		},
		{
			name: "Nanofiber Weave",
			skip: true
		},
		{
			name: "Speech Processor Implant",
			skip: true
		},
		{
			name: "Nuoptimal Nootropic Injector Implant",
			skip: true
		},
		{
			name: "Speech Enhancement",
			skip: true
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
				if (info.name === aug) {
					augInfo = info;
					if (augInfo.skip) {
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