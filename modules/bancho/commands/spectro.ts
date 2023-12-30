import { PrivateMessage } from "bancho.js";
import { ExecException } from "child_process";

import getOrCreateBanchoUser from "../../../database/utils/getOrCreateBanchoUser";
import { bufferToStream } from "../../../helpers/transform/bufferToStream";
import { LegacyBeatmapsetImporter } from "../../osu/fetcher/beatmap/LegacyBeatmapImporter";
import osuApi from "../../osu/fetcher/osuApi";
import { AudioSpectrogram } from "../../osu/spectrogram/AudioSpectrogram";
import { AxerBancho } from "../client";

export default {
    settings: {
        name: "spectro",
        aliases: ["sp"],
        description: "Generate a spectrogram image from the latest /np beatmap",
    },
    run: async function (pm: PrivateMessage, bancho: AxerBancho, args: string[]) {
        // const userApi = await pm.user.fetchFromAPI();
        // if (!userApi) return pm.user.sendMessage("Can't fetch api user");
        // const user = await getOrCreateBanchoUser(userApi.id);
        // if (!user) return pm.user.sendMessage("User not found! Try again.");
        // if (!user.last_beatmapset) return pm.user.sendMessage("Use /np before use this command!");
        // pm.user.sendMessage("Downloading beatmap... This can take a while.");
        // const beatmapInfo = await osuApi.fetch.beatmapset(user.last_beatmapset);
        // if (beatmapInfo.status != 200) return pm.user.sendMessage("Can't find this beatmap!");
        // if (
        //     (beatmapInfo.data.beatmaps?.sort((b, a) => a.total_length - b.total_length)[0]
        //         .total_length || 0) > 600
        // )
        //     return pm.user.sendMessage("This beatmap is too big! Max duration is 10 minutes");
        // const beatmap = await osuApi.download.beatmapset(user.last_beatmapset);
        // if (!beatmap.data || beatmap.status != 200)
        //     return pm.user.sendMessage("Error during beatmap download");
        // const importer = new LegacyBeatmapsetImporter(beatmap.data.buffer, user.last_beatmapset);
        // importer.import();
        // importer.on("end", () => {
        //     pm.user.sendMessage("Beatmap download finished! Generating spectrogram...");
        //     importer.loadBeatmaps();
        //     if (!importer.getBeatmaps()) {
        //         importer.deleteBeatmap();
        //         return pm.user.sendMessage("Invalid beatmapset!");
        //     }
        //     const audioFile = importer.getAudioFileFrom(
        //         importer.getBeatmaps()[0].metadata.beatmapId
        //     );
        //     if (audioFile === null) {
        //         importer.deleteBeatmap();
        //         return pm.user.sendMessage("Can't find beatmap audio file!");
        //     }
        //     if (audioFile.byteLength > 1.5e7) {
        //         importer.deleteBeatmap();
        //         return pm.user.sendMessage(`Max file size must be 15mb or less!`);
        //     }
        //     const spectrogram = new AudioSpectrogram(audioFile);
        //     spectrogram
        //         .on("data", async (image: Buffer) => {
        //             const attachment = await spectrogram.generateDiscordPermalink();
        //             importer.deleteBeatmap();
        //             if (!attachment) {
        //                 return pm.user.sendMessage(
        //                     "Can't generate spectrogram permalink! Try again."
        //                 );
        //             }
        //             const audioData = await spectrogram.getAudioInfo();
        //             pm.user.sendMessage(
        //                 audioData
        //                     ? `${audioData.format.format_name} | ${
        //                           audioData.streams[0].bit_rate
        //                               ? `${Number(audioData.streams[0].bit_rate) / 1000}Kb/s`
        //                               : "Unknown BitRate"
        //                       } | [${attachment} Click here to view your spectrogram]`
        //                     : `[${attachment} Click here to view your spectrogram]`
        //             );
        //         })
        //         .on("error", (error: ExecException) => {
        //             console.error(error);
        //             try {
        //                 importer.deleteOsz();
        //             } catch (e) {
        //                 console.error(e);
        //             }
        //             pm.user.sendMessage(`Error during spectrogram generation: ${error.message}`);
        //         });
        // });
    },
};
