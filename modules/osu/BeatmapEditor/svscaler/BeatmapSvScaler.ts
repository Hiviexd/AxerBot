import { randomBytes } from "crypto";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import {
    Beatmap,
    ControlPoint,
    ControlPointType,
    DifficultyPoint,
    EffectPoint,
    SamplePoint,
    TimingPoint,
} from "osu-classes";
import path from "path";
import { BeatmapEncoder, HoldableObject, SpinnableObject } from "osu-parsers";
import archiver from "archiver";
import { bot } from "../../../../index";

export interface BeatmapSvScalerOptions {
    scaleOd?: boolean;
    scaleAr?: boolean;
    modifyAudioPitch?: boolean;
}

export class BeatmapSvScaler {
    public fileHash = randomBytes(16).toString("hex");
    private baseTempPath = path.resolve("./temp/svscaler");
    private tempPath = path.resolve(path.join(this.baseTempPath, this.fileHash));
    public beatmap: Beatmap;
    public scale = 1.1;

    constructor(beatmap: Beatmap, scale: number) {
        this.beatmap = beatmap;
        this.scale = scale;
    }

    private addToDeletionQueue() {
        bot.TempFileDeletionManager.addToQueue(
            this.fileHash,
            path.join(this.baseTempPath, this.fileHash),
            new Date()
        );

        bot.TempFileDeletionManager.addToQueue(
            `osz.${this.fileHash}`,
            path.join(this.baseTempPath, "osz", this.fileHash),
            new Date()
        );
    }

    private getRateText() {
        return `(${this.scale.toFixed(2)}x SV)`;
    }

    generate() {
        this.addToDeletionQueue.bind(this);

        return new Promise<string>((resolve, reject) => {
            const encoder = new BeatmapEncoder();

            this.scaleTiming();
            this.changeMetadata();
            this.createFolders();

            const output =
                `${this.beatmap.metadata.artist} - ${this.beatmap.metadata.title} (${this.beatmap.metadata.creator}) [${this.beatmap.metadata.version}]`
                    .replace(/\\/g, " ")
                    .replace(/\//g, "")
                    .replace(/<|>/g, ""); // Escape special characters

            encoder
                .encodeToPath(path.join(this.tempPath, output), this.beatmap)
                .then(() => {
                    this.addToDeletionQueue();

                    resolve(this.fileHash);
                })
                .catch(reject);
        });
    }

    packToOSZ() {
        return new Promise<void>((resolve, reject) => {
            const outputOSZFilename =
                `${this.beatmap.metadata.beatmapSetId} ${this.beatmap.metadata.artist} - ${this.beatmap.metadata.title}`
                    .replace(/\\/g, " ")
                    .replace(/\//g, "")
                    .replace(/<|>/g, ""); // Escape special characters

            const outputPath = path.join(
                this.baseTempPath,
                "osz",
                this.fileHash,
                `${outputOSZFilename}.osz`
            );
            const output = createWriteStream(outputPath);
            const archive = archiver("zip");

            output.on("close", () => {
                resolve();
            });

            archive.on("error", reject);

            archive.pipe(output);
            archive.directory(path.join(this.baseTempPath, this.fileHash), false);

            archive.finalize();
        });
    }

    private changeMetadata() {
        this.beatmap.metadata.version = `${this.beatmap.metadata.version} ${this.getRateText()}`;
        this.beatmap.metadata.beatmapId = -1;
        this.beatmap.metadata.tags.push("axerbot", "sv");
    }

    private scaleSliders() {
        this.beatmap.hitObjects = this.beatmap.hitObjects.map((hitObject) => {
            if (hitObject instanceof SpinnableObject || hitObject instanceof HoldableObject) {
                hitObject.endTime *= this.scale;
            }

            return hitObject;
        });
    }

    private scaleTiming() {
        this.beatmap.difficulty.sliderMultiplier *= this.scale;
    }

    private createFolders() {
        if (!existsSync(this.baseTempPath)) mkdirSync(this.baseTempPath);
        if (!existsSync(path.join(this.baseTempPath, this.fileHash)))
            mkdirSync(path.join(this.baseTempPath, this.fileHash));
        if (!existsSync(path.join(this.baseTempPath, "osz")))
            mkdirSync(path.join(this.baseTempPath, "osz"));
        if (!existsSync(path.join(this.baseTempPath, "osz", this.fileHash)))
            mkdirSync(path.join(this.baseTempPath, "osz", this.fileHash));
    }
}
