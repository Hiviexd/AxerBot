import { EmbededUserGroup, User } from "../../../types/user";

export default function parseUsergroup(mapper: User): EmbededUserGroup {
	const userGroupInfo: any = {
		PPY: {
			index: 0,
			name: "peppy",
			icon: "https://media.discordapp.net/attachments/959908232736952420/1037830827784020111/ppy.png",
			colour: "#0066FF",
		},
		SPT: {
			index: 1,
			name: "Support Team",
			icon: "https://media.discordapp.net/attachments/950107895754784908/953775607395807242/spt.png",
			colour: "#ebd047",
		},
		DEV: {
			index: 2,
			name: "Developer",
			icon: "https://media.discordapp.net/attachments/950107895754784908/953774037790769182/dev.png",
			colour: "#eb47d0",
		},
		GMT: {
			index: 3,
			name: "Global Moderator",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173396361226/gmt.png",
			colour: "#99eb47",
		},
		NAT: {
			index: 4,
			name: "Nomination Assessment Team",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173794832414/nat2.png",
			colour: "#eb8c47",
		},
		FA: {
			index: 5,
			name: "Featured Artist",
			colour: "#00ffff",
			icon: "https://media.discordapp.net/attachments/950107895754784908/1000854297745043506/fa.png",
		},
		BN: {
			index: 6,
			name: "Beatmap Nominator",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173199249438/bn2.png",
			probationary: {
				name: "Beatmap Nominator (Probationary)",
				icon: "https://media.discordapp.net/attachments/941102492857557023/948649173983592548/probo.png",
				colour: "#d6c8fc",
			},
			elite: {
				name: "Elite Nominator",
				icon: "https://media.discordapp.net/attachments/941102492857557023/991137703288635462/bn22.png",
				colour: "#ffc05b",
			},
		},
		ALM: {
			index: 7,
			name: "Alumni",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649174197489694/alm.png",
			colour: "#999999",
		},
		LVD: {
			index: 8,
			name: "Project Loved",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173576740915/lvd.png",
			colour: "#ffd1dc",
		},
		BSC: {
			index: 9,
			name: "Beatmap Spotlight Curator",
			icon: "https://media.discordapp.net/attachments/959908232736952420/1037829623142174811/bsc.png",
			colour: "#76AEBC",
		},
		BOT: {
			index: 10,
			name: "BOT",
			colour: "#ffffff",
			icon: "https://media.discordapp.net/attachments/865037717590245436/955965426964258906/bot.png",
		},
	};

	const usergroups = mapper.groups;

	if (!usergroups)
		return {
			icon: "",
			colour: "#1b89d3",
		};

	let groups = new Array(usergroups?.length);

	// ? Sort usergroups
	usergroups?.forEach((g) => {
		const index = userGroupInfo[g.short_name].index;
		groups[index] = g;
		groups[index].index = index;
		groups[index].icon = userGroupInfo[g.short_name].icon;

		//if (g.short_name == "PPY") g.colour = "#eb47d0";

		if (g.is_probationary) {
			groups[index].colour =
				userGroupInfo[g.short_name].probationary.colour;
			groups[index].icon = userGroupInfo[g.short_name].probationary.icon;
		}

		if (g.short_name == "BN" && mapper.title?.includes("Elite Nominator")) {
			groups[index].colour = userGroupInfo[g.short_name].elite.colour;
			groups[index].icon = userGroupInfo[g.short_name].elite.icon;
		}
	});

	if (!groups)
		return {
			icon: "",
			colour: "#1b89d3",
		};

	if (groups.length > 0) {
		groups.sort((a, b) => {
			return a - b;
		});

		let group: EmbededUserGroup = groups[0];

		return group;
	} else {
		return {
			icon: "",
			colour: "#1b89d3",
		};
	}
}
