import {ButtonInteraction, MessageButton,MessageActionRow} from "discord.js";
import storeBeatmap from "../../helpers/osu/fetcher/general/storeBeatmap";
import osuApi from "./../../helpers/osu/fetcher/osuApi"

export default async (button: ButtonInteraction) => {
    const targets = button.customId.split("|")
    if (targets[0] != "beatmap_download") return;

    await button.deferReply();

    console.log(button)

    const beatmapId = targets[1];
    const downloadUrlButton = new MessageActionRow()

    try {
        const beatmap_data = await osuApi.fetch.beatmapset(beatmapId);
        const beatmap_file = await osuApi.download.beatmapset(beatmapId);

        const stored_file = await storeBeatmap(
            beatmap_file,
            beatmap_data.data,
            button
        );

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
                content: `Beatmap downloaded!`,
                components: [downloadUrlButton]
            })
        } else {
            button.editReply({
                content: `This beatmap is too big! I can't download it.`,
            })
        }
    } catch (e) {
        console.error(e);

        button.editReply({
            content: `Something is wrong. I can't download the beatmap.`,
        })
    }


}