import { EmbededUserGroup, User } from "../../../types/user";

export default function getUserGroup(mapper: User): EmbededUserGroup {
	const userGroupInfo: any = {
		PPY: {
			index: 0,
			name: "Dumbass",
			icon: "https://media.discordapp.net/attachments/950107895754784908/953774037790769182/dev.png",
		},
		SPT: {
			index: 1,
			name: "Support Team",
			icon: "https://media.discordapp.net/attachments/950107895754784908/953775607395807242/spt.png?width=229&height=229",
		},
		DEV: {
			index: 2,
			name: "Developer",
			icon: "https://media.discordapp.net/attachments/950107895754784908/953774037790769182/dev.png",
		},
		GMT: {
			index: 3,
			name: "Global Moderator",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173396361226/gmt.png",
		},
		NAT: {
			index: 4,
			name: "Nomination Assessment Team",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173794832414/nat2.png",
		},
		BN: {
			index: 5,
			name: "Beatmap Nominator",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173199249438/bn2.png",
			probationary: {
				name: "Beatmap Nominator (Probationary)",
				icon: "https://media.discordapp.net/attachments/941102492857557023/948649173983592548/probo.png",
				colour: "#d6c8fc",
			},
		},
		ALM: {
			index: 6,
			name: "Alumni",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649174197489694/alm.png",
		},
		LVD: {
			index: 7,
			name: "Project Loved",
			icon: "https://media.discordapp.net/attachments/941102492857557023/948649173576740915/lvd.png",
		},
		BOT: {
			index: 8,
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

		if (g.short_name == "PPY") g.colour = "#eb47d0";

		if (g.is_probationary) {
			groups[index].colour =
				userGroupInfo[g.short_name].probationary.colour;
			groups[index].icon = userGroupInfo[g.short_name].probationary.icon;
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
