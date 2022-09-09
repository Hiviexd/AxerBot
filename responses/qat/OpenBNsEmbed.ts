import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { QatAllUsersResponse, QatUser } from "../../types/qat";
import getOpenBNsPerMode from "../../helpers/qat/getters/requestStatus/getOpenBNsPerMode";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";

export default {
	reply: (
		qatAllUsers: QatAllUsersResponse,
		gamemode: string | undefined,
		command: CommandInteraction,
		guild: any
	) => {
		let openBNs: QatUser[] = [];

		let parseUsergroupFromQatUser = (user: QatUser): string => {
			let usergroup = "";
			if (user.groups.includes("nat")) {
				usergroup = "<:1nat:992500805527674940>";
			} else if (
				user.groups.includes("bn") &&
				user.probationModes.length === 0
			) {
				usergroup = "<:2bn:992500782274457702>";
			} else usergroup = "<:3probo:992500821591867442>";
			return usergroup;
		};

		qatAllUsers.data.forEach((user: QatUser) => {
			if (
				!user.requestStatus.includes("closed") &&
				user.requestStatus.length > 0
			) {
				openBNs.push(user);
			}
		});

		let e = new MessageEmbed().setColor("#27b6b3");
		//.setDescription(`According to the **[BN/NAT website](https://bn.mappersguild.com/)**`);

		if (gamemode) {
			e.setAuthor({
				name: `${
					getOpenBNsPerMode(openBNs, gamemode, "link").split("\n")
						.length
				} open osu!${gamemode === "osu" ? "" : gamemode} BNs`,
				url: `https://bn.mappersguild.com/`,
				iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
			})
				.setDescription(
					`${getOpenBNsPerMode(openBNs, gamemode, "status")}`
				)
				.setFooter({
					text: `use \"/openbns\" to view all open BNs.`,
				});
		} else {
			e.setAuthor({
				name: `${openBNs.length} open BNs`,
				url: "https://bn.mappersguild.com/",
				iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
			})
				.addField(
					"osu",
					`${getOpenBNsPerMode(openBNs, "osu", "link")}`,
					true
				)
				.addField(
					"taiko",
					`${getOpenBNsPerMode(openBNs, "taiko", "link")}`,
					true
				)
				.addField(
					"mania",
					`${getOpenBNsPerMode(openBNs, "mania", "link")}`,
					true
				)
				.addField(
					"catch",
					`${getOpenBNsPerMode(openBNs, "catch", "link")}`,
					true
				)
				.setFooter({
					text: `use \"/openbns <gamemode>\" to view more details.`,
				});
		}
		command.editReply({ embeds: [e] });
	},
};
