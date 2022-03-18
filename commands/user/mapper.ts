import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import UserNotFound from "../../data/embeds/UserNotFound";
import osuApi from "../../utils/osu/osuApi";
import getMappingAge from "./utils/getMappingAge";
import getUserGroup from "./utils/getUserGroup";
import UserNotMapper from "../../data/embeds/UserNotMapper";
import * as database from "./../../database";
import createNewUser from "../../database/utils/createNewUser";

export default {
	name: "mapper",
	description: "Displays mapper statistics of a user",
	syntax: "!mapper `<user>`",
	example: "!mapper `Hivie`\n!mapper",
	category: "osu",
	slash: {
		name: "mapper",
		description: "Displays mapper statistics of a user",
		options: [
			{
				name: "username",
				description: "Type the username to get info",
				required: false,
				type: "STRING",
			},
			{
				name: "mention",
				description: "Mention a server member to get info",
				required: false,
				type: "USER",
			},
		],
	},
	run: async (
		bot: Client,
		interaction: CommandInteraction,
		args: Array<string>
	) => {
		let mapper_name = "";
		const mention_field = interaction.options.getUser("mention");
		const username_field = interaction.options.getString("username");

		if (mention_field != null) {
			const u = await database.users.findOne({
				_id: mention_field.id,
			});

			if (u != null) mapper_name = u.osu.username;
		}

		if (username_field != null) mapper_name = username_field;

		if (!mention_field && !username_field) {
			let author = await database.users.findOne({
				_id: interaction.user.id,
			});

			if (!author) author = await createNewUser(interaction.user);

			mapper_name = author.osu.username;
		}

		if (mapper_name == undefined || !mapper_name)
			return interaction.reply({
				embeds: [UserNotFound],
			});

		const mapper_user = await osuApi.fetch.user(encodeURI(mapper_name));

		if (mapper_user.status != 200)
			return interaction.reply({
				embeds: [UserNotFound],
			});

		const mapper_beatmaps = await osuApi.fetch.userBeatmaps(
			mapper_user.data.id.toString()
		);

		if (mapper_beatmaps.status != 200) return;

		if (mapper_beatmaps.data.sets.length < 1)
			return interaction.reply({
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
					value: `▶ ${mapper_beatmaps.data.sets_playcount.toLocaleString(
						"en-US"
					)} 💖 ${mapper_beatmaps.data.sets_favourites.toLocaleString(
						"en-US"
					)}`,
				},
				{
					name: "Latest Map",
					value: `[${mapper_beatmaps.data.last.artist} - ${mapper_beatmaps.data.last.title}](https://osu.ppy.sh/s/${mapper_beatmaps.data.last.id})`,
				},
			],
			author: {
				name: `${mapper_user.data.username}`,
				url: `https://osu.ppy.sh/users/${mapper_user.data.id}`,
				iconURL: usergroup.icon,
			},
			image: {
				url: mapper_beatmaps.data.last.covers["cover@2x"],
			},
		});

		interaction.reply({
			embeds: [e],
		});
	},
};
