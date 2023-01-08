import { Client, CommandInteraction, Message } from "discord.js";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import OpenBNsEmbed from "../../responses/qat/OpenBNsEmbed";

export default {
	name: "openbns",
	help: {
		description:
			"Displays a list of currently open BNs/NATs based on data from the BN website",
		syntax: "/openbns\n/openbns `<gamemode>`",
		gamemodes: "`osu`, `taiko`, `catch`, `mania`",
		example: "/openbns\n/openbns `taiko`",
	},
	interaction: true,
	config: {
		type: 1,
		max_value: 1,
		options: [
			{
				name: "gamemode",
				description: "Filter by game mode",
				type: 3,
				choices: [
					{
						name: "osu",
						value: "osu",
					},
					{
						name: "taiko",
						value: "taiko",
					},
					{
						name: "catch",
						value: "catch",
					},
					{
						name: "mania",
						value: "mania",
					},
				],
			},
		],
	},
	category: "BNsite",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply(); // ? prevent errors

		let gamemode: string | undefined = undefined;

		const gamemodeInput = command.options.get("gamemode");

		if (gamemodeInput && gamemodeInput.value) {
			gamemode = gamemodeInput.value.toString();
		}

		const qatAllUsers = await qatApi.fetch.allUsers();

		if (qatAllUsers.status != 200)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"Failed to fetch all users from the BN website"
					),
				],
			});

		OpenBNsEmbed.reply(qatAllUsers, gamemode, command);
	},
};
