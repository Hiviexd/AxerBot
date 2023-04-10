import { PrivateMessage, BanchoClient } from "bancho.js";
import getOrCreateBanchoUser from "../../../database/utils/getOrCreatBanchoUser";
import osuApi from "../../osu/fetcher/osuApi";
import { LegacyBeatmapsetImporter } from "../../osu/fetcher/beatmap/LegacyBeatmapImporter";
import { AudioSpectrogram } from "../../osu/spectrogram/AudioSpectrogram";
import { bufferToStream } from "../../../helpers/transform/bufferToStream";
import { ExecException } from "child_process";
import storeBeatmap from "../../osu/fetcher/general/storeBeatmap";

export default {
    settings: {
        name: "spectro",
        description: "Generate a spectrogram image from the latest /np beatmap",
    },
    run: async function (
        pm: PrivateMessage,
        bancho: BanchoClient,
        args: string[]
    ) {
        const userApi = await pm.user.fetchFromAPI();

        if (!userApi) return pm.user.sendMessage("Can't fetch api user");

        const user = await getOrCreateBanchoUser(userApi.id);

        if (!user) return pm.user.sendMessage("User not found! Try again.");

        if (!user.last_beatmapset)
            return pm.user.sendMessage("Use /np before use this command!");

        pm.user.sendMessage("Downloading beatmap... This can take a while.");

        const beatmap = await osuApi.download.beatmapset(user.last_beatmapset);

        if (!beatmap.data || beatmap.status != 200)
            return pm.user.sendMessage("Error during beatmap download");

        const importer = new LegacyBeatmapsetImporter(
            beatmap.data.buffer,
            user.last_beatmapset
        );

        importer.import();

        importer.on("end", () => {
            pm.user.sendMessage(
                "Beatmap download finished! Generating spectrogram..."
            );

            importer.loadBeatmaps();

            if (!importer.getBeatmaps())
                return pm.user.sendMessage("Invalid beatmapset!");

            const audioFile = importer.getAudioFileFrom(
                importer.getBeatmaps()[0].metadata.beatmapId
            );

            if (audioFile === null)
                return pm.user.sendMessage("Can't find beatmap audio file!");

            const audioStream = bufferToStream(audioFile);

            const spectrogram = new AudioSpectrogram();
            spectrogram.setAudio(audioStream);
            spectrogram.start();

            spectrogram
                .on("data", async (image: Buffer) => {
                    const attachment =
                        await spectrogram.generateDiscordPermalink();

                    importer.deleteBeatmap();

                    if (!attachment) {
                        return pm.user.sendMessage(
                            "Can't generate spectrogram permalink! Try again."
                        );
                    }

                    pm.user.sendMessage(
                        `[${attachment} Click here to view your spectrogram]`
                    );
                })
                .on("error", (error: ExecException) => {
                    console.error(error);

                    try {
                        importer.deleteOsz();
                    } catch (e) {
                        console.error(e);
                    }

                    pm.user.sendMessage(
                        `Error during spectrogram generation: ${error.message}`
                    );
                });
        });
    },
};
