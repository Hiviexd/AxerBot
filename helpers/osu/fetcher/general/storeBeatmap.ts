import { Message, MessageAttachment } from "discord.js";
import { Beatmapset, BeatmapsetCompact } from "../../../../types/beatmap";

export default async (
	beatmap_file: any,
	beatmapset: BeatmapsetCompact | Beatmapset,
	message: Message
) => {
	let big = false;
	const beatmap_attachment = new MessageAttachment(
		beatmap_file.data.buffer,
		`${beatmapset.id} ${beatmapset.artist} - ${beatmapset.title}.osz`
	);

	if (beatmap_file.data.size > 8000000) {
		big = true;

		return {
			big,
			url: "https://osu.ppy.sh/",
		};
	}

	let beatmap_url = "";

	const cache_guild = message.client.guilds.cache.find(
		(g) => g.id == "589557574702071819"
	);

	if (cache_guild) {
		const cache_channel: any = cache_guild.channels.cache.find(
			(c) => c.id == "959824657576521828"
		);

		const m = await cache_channel.send({
			files: [beatmap_attachment],
		});

		beatmap_url = m.attachments.first().url;
	}

	return {
		big,
		url: beatmap_url,
	};
};
