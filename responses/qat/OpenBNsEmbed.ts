import { CommandInteraction, MessageEmbed } from "discord.js";
import { QatAllUsersResponse, QatUser } from "../../types/qat";
import getOpenBNsPerMode from "../../helpers/qat/getters/requestStatus/getOpenBNsPerMode";
import colors from "../../constants/colors";

export default {
	reply: (
		qatAllUsers: QatAllUsersResponse,
		gamemode: string | undefined,
		command: CommandInteraction,
		guild: any
	) => {
		let openBNs: QatUser[] = [];

		qatAllUsers.data.forEach((user: QatUser) => {
			if (
				!user.requestStatus.includes("closed") &&
				user.requestStatus.length > 0
			) {
				openBNs.push(user);
			}
		});

		let e = new MessageEmbed().setColor(colors.qat);
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
					`osu! (${
						getOpenBNsPerMode(openBNs, "osu", "link").split("\n")
							.length
					})`,
					`${getOpenBNsPerMode(openBNs, "osu", "link")}`,
					true
				)
				.addField(
					`osu!taiko (${
						getOpenBNsPerMode(openBNs, "taiko", "link").split("\n")
							.length
					})`,
					`${getOpenBNsPerMode(openBNs, "taiko", "link")}`,
					true
				)
				.addField(
					`osu!mania (${
						getOpenBNsPerMode(openBNs, "mania", "link").split("\n")
							.length
					})`,
					`${getOpenBNsPerMode(openBNs, "mania", "link")}`,
					true
				)
				.addField(
					`osu!catch (${
						getOpenBNsPerMode(openBNs, "catch", "link").split("\n")
							.length
					})`,
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
