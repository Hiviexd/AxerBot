import { Client, Message } from "discord.js";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import OpenBNsEmbed from "../../responses/qat/OpenBNsEmbed";

export default {
	name: "openbns",
	help: {
		description:
			"Displays a list of currently open BNs/NATs based on data from the BN website",
        syntax: "{prefix}openbns\n{prefix}openbns `<gamemode>`",
        gamemodes: "`osu`, `taiko`, `catch`, `mania`",
		example: "{prefix}openbns\n{prefix}openbns `taiko`",
	},
	category: "BNsite",
	run: async (bot: Client, message: Message, args: string[]) => {
		const gamemode = ["osu", "taiko", "catch", "mania"];

		if (args.length > 0) {
			if (!gamemode.includes(args[0].toLowerCase())) {
				return message.channel.send({
					embeds: [
						generateErrorEmbed(`Invalid gamemode: \`${args[0]}\``),
					],
				});
			}
		}
        message.channel.sendTyping();

		const qatAllUsers = await qatApi.fetch.allUsers();

		if (qatAllUsers.status != 200)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"Failed to fetch all users from the QAT website"
					),
				],
			});
        
        
        OpenBNsEmbed.send(qatAllUsers, args[0], message)
	},
};
