export default function getUserGroup(mapper: any) {
	const icons: any = {
		BN: "https://media.discordapp.net/attachments/941102492857557023/948649173199249438/bn2.png",
		BNP: "https://media.discordapp.net/attachments/941102492857557023/948649173983592548/probo.png",
		GMT: "https://media.discordapp.net/attachments/941102492857557023/948649173396361226/gmt.png",
		LVD: "https://media.discordapp.net/attachments/941102492857557023/948649173576740915/lvd.png",
		NAT: "https://media.discordapp.net/attachments/941102492857557023/948649173794832414/nat2.png",
		ALM: "https://media.discordapp.net/attachments/941102492857557023/948649174197489694/alm.png",
	};

	const groups: Array<any> = mapper.groups;

	if (groups.length > 0) {
		groups.sort((a, b) => {
			return a.id - b.id;
		});

		let group: any = groups.shift();
		group["name"] = `(${group.name})`;
		group["icon"] = icons[group.short_name];

		if (group.is_probationary && group.short_name == "BN") {
			group.icon = icons["BNP"];
			group.colour = "#d6c8fc";
		}

		return group;
	} else {
		return {
			name: "",
			icon: "",
			colour: "#1b89d3",
		};
	}
}
