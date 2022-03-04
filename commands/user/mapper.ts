import { Client, Message, MessageEmbed } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../utils/osu/osuApi";
import getMappingAge from "./utils/getMappingAge";
import getUserGroup from "./utils/getUserGroup";
import numeral from "numeral";
import UserNotMapper from "../../data/embeds/UserNotMapper";

export default {
	name: "mapper",
	run: async (bot: Client, message: Message, args: Array<string>) => {
		const mapper_name = args.join("_");
		const mapper_user = await osuApi.fetch.user(mapper_name);

		if (mapper_user.status != 200)
			return message.channel.send({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper_user.data.id
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return message.channel.send({
				embeds: [UserNotMapper],
			});

		const usergroup = getUserGroup(mapper_user.data);

		let e = new MessageEmbed({
			thumbnail: {
				url: `https://a.ppy.sh/${mapper_user.data.id}`,
			},
			color: usergroup.colour,
			fields: [
				{
					name: "Mapping for",
					value: getMappingAge(mapper_beatmaps.data),
				},
				{
					name: "Mapset Count",
					inline: true,
					value: `🗺️ ${mapper_beatmaps.data.sets.length} ✅ ${
						mapper_user.data.ranked_and_approved_beatmapset_count
					} ❤ ${mapper_user.data.loved_beatmapset_count} ❓ ${
						Number(mapper_user.data.pending_beatmapset_count) +
						Number(mapper_user.data.graveyard_beatmapset_count)
					}
					`,
				},
				{
					name: "Playcount & Favorites",
					inline: true,
					value: `▶ ${numeral(
						mapper_beatmaps.data.sets_playcount
					).format("0,0")} 💖 ${numeral(
						mapper_beatmaps.data.sets_favourites
					).format("0,0")}`,
				},
				{
					name: "Latest Map",
					value: `[${mapper_beatmaps.data.last.artist} - ${mapper_beatmaps.data.last.title}](https://osu.ppy.sh/s/${mapper_beatmaps.data.last.id})`,
				},
			],
			author: {
				name: `${mapper_user.data.username} ${usergroup.name}`,
				url: `https://osu.ppy.sh/users/${mapper_user.data.id}`,
				iconURL: usergroup.icon,
			},
			image: {
				url: mapper_beatmaps.data.last.covers["cover@2x"],
			},
		});

		message.channel.send({
			embeds: [e],
		});
	},
};
