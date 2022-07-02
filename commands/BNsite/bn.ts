import { Client, CommandInteraction, Message } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import UserNotBNorNAT from "../../responses/qat/UserNotBNorNAT";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";
import BNEmbed from "../../responses/qat/BNEmbed";
import interactionCreate from "../../events/interactionCreate";

export default {
	name: "bn",
	help: {
		description:
			"Displays nominator data of a BN/NAT from the last 90 days",
		example:
			"{prefix}bn\n{prefix}bn `Hivie`\n{prefix}bn <@341321481390784512>\n{prefix}bn `HEAVENLY MOON`",
		note: "You won't need to specify your username if you set yourself up with this command:\n`{prefix}osuset user <username>`",
	},
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "user",
				description: "By user mention (This doesn't ping the user)",
				type: 6,
			},
			{
				name: "username",
				description: "By osu! username",
				type: 3,
			},
		],
	},
	category: "BNsite",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		command.deferReply(); // ? prevent errors

		let { playerName, status } = await checkCommandPlayers(command);

		if (status != 200) return;

		// fetch user from osu api to get their id
		const osuUser = await osuApi.fetch.user(encodeURI(playerName));

		if (osuUser.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
			});

		// use id from before to fetch qatUser
		const qatUser = await qatApi.fetch.user(osuUser.data.id);

		if (qatUser.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
			});

		const userRes = qatUser.data;
		if (!userRes.groups.find((g) => ["bn", "nat"].includes(g))) {
			return command.editReply({
				embeds: [UserNotBNorNAT],
			});
		}

		const qatUserActivity = await qatApi.fetch.userActivity(
			osuUser.data.id,
			90
		); //? 90 days

		if (qatUserActivity.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
			});

		// ? refactory this, add a option to support interaction instead message (Check mapper embed), we will remove message option later
		BNEmbed.reply(osuUser, qatUser, qatUserActivity, command);
	},
};
