import { UserResponse } from "../../types/user";
import { Beatmapset } from "../../types/beatmap";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "discord.js";
import parseUsergroup from "../../helpers/osu/player/getHighestUsergroup";

export default {
	send: (
		user: UserResponse,
		beatmaps: Beatmapset[],
		message: Message,
		decorator: any
	) => {
		const usergroup = parseUsergroup(user.data);
		let embed_description = "";

		function geneateEmbedDescription() {
			let size = 0;
			beatmaps.map((b) => {
				if (size < 10) {
					size++;

					// ? Use the emoji to get the data
					if (decorator.emoji == "▶") {
						return (embed_description = embed_description.concat(
							`**${size}** • [${b.artist} - ${
								b.title
							}](https://osu.ppy.sh/s/${b.id}) | ${
								decorator.emoji
							} ${b.play_count.toLocaleString("en-US")} \n`
						));
					} else {
						return (embed_description = embed_description.concat(
							`**${size}** • [${b.artist} - ${
								b.title
							}](https://osu.ppy.sh/s/${b.id}) | ${
								decorator.emoji
							} ${b.favourite_count.toLocaleString("en-US")} \n`
						));
					}
				}
			});
		}

		geneateEmbedDescription(); // ? Generate the rank

		let e = new EmbedBuilder({
			thumbnail: {
				url: `https://a.ppy.sh/${user.data.id}`,
			},
			color: usergroup.colour,
			description: embed_description,
			author: {
				name: `${user.data.username} | ${decorator.title}`,
				url: `https://osu.ppy.sh/users/${user.data.id}`,
				iconURL: usergroup.icon ? usergroup.icon : undefined,
			},
		});

		// ? Ooooh boi, send
		message.channel.send({
			embeds: [e],
		});
	},
	reply: (
		user: UserResponse,
		beatmaps: Beatmapset[],
		command: ChatInputCommandInteraction,
		decorator: any
	) => {
		const usergroup = parseUsergroup(user.data);
		let embed_description = "";

		function geneateEmbedDescription() {
			let size = 0;
			beatmaps.map((b) => {
				if (size < 10) {
					size++;

					// ? Use the emoji to get the data
					if (decorator.emoji == "▶") {
						return (embed_description = embed_description.concat(
							`**${size}** • [${b.artist} - ${
								b.title
							}](https://osu.ppy.sh/s/${b.id}) | ${
								decorator.emoji
							} ${b.play_count.toLocaleString("en-US")} \n`
						));
					} else {
						return (embed_description = embed_description.concat(
							`**${size}** • [${b.artist} - ${
								b.title
							}](https://osu.ppy.sh/s/${b.id}) | ${
								decorator.emoji
							} ${b.favourite_count.toLocaleString("en-US")} \n`
						));
					}
				}
			});
		}

		geneateEmbedDescription(); // ? Generate the rank

		let e = new EmbedBuilder({
			thumbnail: {
				url: `https://a.ppy.sh/${user.data.id}`,
			},
			color: usergroup.colour,
			description: embed_description,
			author: {
				name: `${user.data.username} | ${decorator.title}`,
				url: `https://osu.ppy.sh/users/${user.data.id}`,
				iconURL: usergroup.icon ? usergroup.icon : undefined,
			},
		});

		// ? Ooooh boi, send
		command.editReply({
			embeds: [e],
		});
	},
};
