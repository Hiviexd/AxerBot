import { Message, MessageEmbed } from "discord.js";
import { QatAllUsersResponse, QatUser } from "../../types/qat";
import getOpenBNsPerMode from "../../helpers/qat/getters/requestStatus/getOpenBNsPerMode";
import parseMessagePlaceholderFromString from "../../helpers/text/parseMessagePlaceholderFromString";

export default {
	send: (
		qatAllUsers: QatAllUsersResponse,
		gamemode: string,
		message: Message,
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

		let e = new MessageEmbed().setColor("#27b6b3");
		//.setDescription(`According to the **[BN/NAT website](https://bn.mappersguild.com/)**`);

		if (gamemode) {
			e.setAuthor({
				name: `${
					getOpenBNsPerMode(openBNs, gamemode, "link").split("\n")
						.length
				} open ${gamemode} BNs`,
				url: `https://bn.mappersguild.com/`,
				iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
			})
				.setDescription(
					`${getOpenBNsPerMode(openBNs, gamemode, "status")}`
				)
				.setFooter({
					text: parseMessagePlaceholderFromString(
						message,
						guild,
						`use \"{prefix}openbns\" to view all open BNs.`
					),
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
					text: parseMessagePlaceholderFromString(
						message,
						guild,
						`use \"{prefix}openbns <gamemode>\" to view more details.`
					),
				});
		}
		message.channel.send({ embeds: [e] });
	},
};
