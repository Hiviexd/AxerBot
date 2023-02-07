import { Client, ChatInputCommandInteraction, Message } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import UserNotMapper from "../../responses/embeds/UserNotMapper";
import MapperEmbed from "../../responses/osu/MapperEmbed";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";
import checkCommandPlayers from "../../helpers/osu/player/checkCommandPlayers";

export default {
	name: "mapper",
	help: {
		description: "Displays mapper statistics of a user",
		syntax: "/mapper `<user>`",
		example:
			"/mapper `Hivie`\n /mapper <@341321481390784512>\n /mapper `HEAVENLY MOON`",
		note: "You won't need to specify your username if you set yourself up with this command:\n`/osuset user <username>`",
	},
	category: "osu",
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "username",
				description: "By osu! username",
				type: 3,
				max_value: 1,
			},
			/*{
				name: "usermention",
				description: "By user mention (This doesn't ping the user)",
				type: 6,
				max_value: 1,
			},*/
		],
	},
	run: async (bot: Client, command: ChatInputCommandInteraction) => {
		await command.deferReply();

		let { playerName, status } = await checkCommandPlayers(command);

		if (status != 200) return;

		const mapper = await osuApi.fetch.user(encodeURI(playerName));

		if (mapper.status != 200)
			return command.editReply({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper.data.id.toString()
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return command.editReply({
				embeds: [UserNotMapper],
			});

		MapperEmbed.reply(mapper, mapper_beatmaps, command);
	},
};
