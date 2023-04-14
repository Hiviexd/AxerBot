import { getFfmpegInstance } from "../transform/getFfmppegInstance";
import path from "path";
import crypto from "crypto";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { validateCacheFolder } from "../validators/validateCacheFolder";
import { createCanvas, loadImage, registerFont } from "canvas";
import { Beatmapset } from "../../types/beatmap";
import { truncateCanvasText } from "../transform/truncateCanvasText";
import { bufferToStream } from "../transform/bufferToStream";
import axios from "axios";

export interface IBeatmapVideo {
    fileId: string;
    filePath: string;
    video: Buffer;
}

export async function generateBeatmapVideo(
    beatmapset: Beatmapset
): Promise<IBeatmapVideo> {
    return new Promise(async (resolve, reject) => {
        validateCacheFolder();

        // Check if cache folder exists
        if (!existsSync(path.resolve("./cache/previews")))
            mkdirSync(path.resolve("./cache/previews"));

        const fileId = crypto.randomBytes(10).toString("hex");
        const filePath = path.resolve(`./cache/previews/${fileId}.webm`);

        let cover = `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/card.jpg`;
        const audio = `https://b.ppy.sh/preview/${beatmapset.id}.mp3`;

        async function getCoverImage() {
            try {
                await axios(cover);

                return cover;
            } catch (e) {
                return "https://media.discordapp.net/attachments/959908232736952420/1096495922831167528/default-bg.7594e945.png";
            }
        }

        const canvas = createCanvas(400, 140);
        const ctx = canvas.getContext("2d");
        const bg = await loadImage(await getCoverImage());
        registerFont(path.resolve("./assets/fonts/quicksand.ttf"), {
            family: "Quicksand",
        });

        ctx.drawImage(bg, 0, 0);

        const title = truncateCanvasText(
            ctx,
            beatmapset.title,
            380,
            "600 40px Quicksand"
        );
        const artist = truncateCanvasText(
            ctx,
            beatmapset.artist,
            380,
            "400 25px Quicksand"
        );

        ctx.fillStyle = "#00000050";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "600 40px Quicksand";
        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            title,
            10,
            20 + ctx.measureText(title).actualBoundingBoxAscent
        );

        ctx.font = "400 25px Quicksand";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(
            artist,
            10 + ctx.measureText(title).actualBoundingBoxLeft,
            55 + ctx.measureText(title).actualBoundingBoxAscent
        );

        const canvasStream = bufferToStream(canvas.toBuffer());

        const ffmpeg = getFfmpegInstance()
            .addInput(canvasStream)
            .addInput(audio)
            .fpsOutput(1)
            .outputFormat("webm");

        ffmpeg.saveToFile(filePath);

        ffmpeg.on("end", () => {
            return resolve({ filePath, fileId, video: readFileSync(filePath) });
        });

        ffmpeg.on("error", reject);
    });
}
