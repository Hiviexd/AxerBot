import { Client, Message } from "discord.js";
import osuApi from "../../utils/osu/osuApi";

export default {
	name: "beatmap",
	run: async (bot: Client, message: Message, args: string[]) => {
		let map = await osuApi.fetch.beatmap(args[0]);
		return message.channel.send(
			`${map.data.beatmapset.artist} - ${map.data.beatmapset.title} [${map.data.version}]`
		);
	},
};
