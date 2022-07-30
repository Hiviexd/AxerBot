import { ButtonInteraction, MessageButton, MessageActionRow } from "discord.js";
import relativeTime from "../../helpers/general/relativeTime";
import storeBeatmap from "../../helpers/osu/fetcher/general/storeBeatmap";
import osuApi from "./../../helpers/osu/fetcher/osuApi";

export default async (button: ButtonInteraction) => {
	const targets = button.customId.split("|");
	if (targets[0].trim() != "beatmap_download") return;

	const time = new Date();

	await button.deferReply({ ephemeral: true });

	const beatmapId = targets[1].trim();
	const downloadUrlButton = new MessageActionRow();

	try {
		const beatmap_data = await osuApi.fetch.beatmapset(beatmapId);
		const beatmap_file = await osuApi.download.beatmapset(beatmapId);

		const stored_file = await storeBeatmap(
			beatmap_file,
			beatmap_data.data,
			button
		);

		if (stored_file.error)
			return button.editReply({
				content: `Something is wrong. I can't download your beatmap... You can try it again.`,
			});

		if (!stored_file.big) {
			downloadUrlButton.addComponents([
				new MessageButton({
					type: "BUTTON",
					style: "LINK",
					url: stored_file.url,
					label: "Download Beatmap",
				}),
			]);

			button.editReply({
				content: `Beatmap downloaded! (It took ${relativeTime(
					new Date(),
					time
				)})`,
				components: [downloadUrlButton],
			});
		} else {
			button.editReply({
				content: `This beatmap is too big! I can't download it.`,
			});
		}
	} catch (e) {
		console.error(e);

		button.editReply({
			content: `Something is wrong. I can't download the beatmap.`,
		});
	}
};
