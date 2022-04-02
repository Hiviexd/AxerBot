import { Client, Message } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import MapperEmbed from "../../responses/osu/MapperEmbed";
import checkMessagePlayers from "../../helpers/osu/player/checkMessagePlayers";

export default {
	name: "mapper",
	help: {
		description: "Displays mapper statistics of a user",
		syntax: "{prefix}mapper `<user>`",
		example: "{prefix}mapper `Hivie`\n!mapper",
	},
	category: "osu",
	run: async (bot: Client, message: Message, args: Array<string>) => {
		let { playerName, status } = await checkMessagePlayers(message, args);

		if (status != 200) return;

		const mapper = await osuApi.fetch.user(encodeURI(playerName));

		if (mapper.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper.data.id.toString()
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return message.channel.send({
				embeds: [UserNotMapper],
			});

		MapperEmbed.send(mapper, mapper_beatmaps, message);
	},
};
