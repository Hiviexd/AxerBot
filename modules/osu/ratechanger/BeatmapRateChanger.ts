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
import internal from "stream";
import { bufferToStream } from "../../../helpers/transform/bufferToStream";
import { BeatmapEncoder, HoldableObject, SpinnableObject } from "osu-parsers";
import Ffmpeg from "fluent-ffmpeg";
import archiver from "archiver";
import { bot } from "../../..";

export interface BeatmapRateChangerOptions {
    scaleOd?: boolean;
    scaleAr?: boolean;
    modifyAudioPitch?: boolean;
}

export class BeatmapRateChanger {
    public fileHash = randomBytes(16).toString("hex");
    private baseTempPath = path.resolve("./temp/ratechange");
    private tempPath = path.resolve(path.join(this.baseTempPath, this.fileHash));
    public beatmap: Beatmap;
    public audioFile: internal.Readable;
    public rate: number;
    public options;

    constructor(
        beatmap: Beatmap,
        audioFile: Buffer,
        rate: number,
        options?: BeatmapRateChangerOptions
    ) {
        this.beatmap = beatmap;
        this.audioFile = bufferToStream(audioFile);
        this.rate = rate;
        this.options = options;
    }

    private addToDeletionQueue() {
        console.log("test");
        bot.RateChangeDeletionManager.addToQueue(this.fileHash, new Date());
    }

    generate() {
        this.addToDeletionQueue.bind(this);

        return new Promise<string>((resolve, reject) => {
            const encoder = new BeatmapEncoder();

            this.scaleTimingPoints();
            this.scaleObjects();
            this.changeMetadata();
            this.scaleDifficulty();
            this.scaleBreakTimes();

            this.createFolders();

            this.changeAudioRate()
                .then(() => {
                    const output =
                        `${this.beatmap.metadata.artist} - ${this.beatmap.metadata.title} (${this.beatmap.metadata.creator}) [${this.beatmap.metadata.version}]`
                            .replace(/\\/g, " ")
                            .replace(/\//g, ""); // Prevent folder creation

                    encoder
                        .encodeToPath(path.join(this.tempPath, output), this.beatmap)
                        .then(() => {
                            this.addToDeletionQueue();

                            resolve(this.fileHash);
                        });
                })
                .catch(reject);
        });
    }

    private scaleBreakTimes() {
        const allBreakTimes = this.beatmap.events.breaks;

        for (const breakTime of allBreakTimes) {
            breakTime.startTime = Math.round(breakTime.startTime / this.rate);
            breakTime.endTime = Math.round(this.rate);
        }
    }

    private scaleDifficulty() {
        if (this.options?.scaleAr)
            this.beatmap.difficulty.approachRate = Math.round(this.calculateMultipliedAR());
        if (this.options?.scaleOd)
            this.beatmap.difficulty.overallDifficulty = Math.round(this.calculateMultipliedOD());
    }

    private changeAudioRate() {
        return new Promise((resolve, reject) => {
            Ffmpeg(this.audioFile)
                .audioFilter(`atempo=${this.rate}`)
                .output(path.resolve(path.join(this.tempPath, this.beatmap.general.audioFilename)))
                .on("end", resolve)
                .on("error", reject)
                .run();
        });
    }

    packToOSZ() {
        return new Promise<void>((resolve, reject) => {
            const outputOSZFilename =
                `${this.beatmap.metadata.beatmapSetId} ${this.beatmap.metadata.artist} - ${this.beatmap.metadata.title}`
                    .replace(/\\/g, " ")
                    .replace(/\//g, ""); // Prevent folder creation

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
        this.beatmap.metadata.version = `${this.beatmap.metadata.version} ${this.rate}x`;
        this.beatmap.general.audioFilename = `(${this.rate}x) ${this.beatmap.general.audioFilename}`;
        this.beatmap.general.previewTime = Math.round(this.beatmap.general.previewTime / this.rate);
        this.beatmap.metadata.beatmapId = -1;
        this.beatmap.metadata.tags.push("axerbot");
    }

    private scaleObjects() {
        this.beatmap.hitObjects = this.beatmap.hitObjects.map((hitObject) => {
            hitObject.startTime /= this.rate;

            if (hitObject instanceof SpinnableObject || hitObject instanceof HoldableObject) {
                hitObject.endTime /= this.rate;
            }

            return hitObject;
        });
    }

    private getNewPointInstance(type: ControlPointType) {
        switch (type) {
            case ControlPointType.DifficultyPoint:
                return new DifficultyPoint();
            case ControlPointType.SamplePoint:
                return new SamplePoint();
            case ControlPointType.EffectPoint:
                return new EffectPoint();
            case ControlPointType.TimingPoint:
                return new TimingPoint();
        }
    }

    private scaleTimingPoints() {
        const beatmapTimingPoints = this.beatmap.controlPoints.allPoints;

        const newPoints: [ControlPoint, number][] = [];

        for (const point of beatmapTimingPoints) {
            const newStartTime = point.startTime != 0 ? point.startTime / this.rate - 0.5 : 0;

            const newTimingPoint = this.getNewPointInstance(point.pointType);

            if (point instanceof TimingPoint && newTimingPoint instanceof TimingPoint) {
                newTimingPoint.timeSignature = point.timeSignature;
                newTimingPoint.beatLength = point.beatLength / this.rate;
            }

            if (point instanceof EffectPoint && newTimingPoint instanceof EffectPoint) {
                newTimingPoint.kiai = point.kiai;
                newTimingPoint.omitFirstBarLine = point.omitFirstBarLine;
                newTimingPoint.scrollSpeed = point.scrollSpeed;
            }

            if (point instanceof DifficultyPoint && newTimingPoint instanceof DifficultyPoint) {
                newTimingPoint.sliderVelocity = point.sliderVelocity;
                newTimingPoint.bpmMultiplier = point.bpmMultiplier;
            }

            if (point instanceof SamplePoint && newTimingPoint instanceof SamplePoint) {
                newTimingPoint.volume = point.volume;
                newTimingPoint.customIndex = point.customIndex;
                newTimingPoint.sampleSet = point.sampleSet;
                newTimingPoint.customIndex = point.customIndex;
            }

            newPoints.push([newTimingPoint, newStartTime]);
        }

        this.beatmap.controlPoints.clear();

        for (const point of newPoints) {
            this.beatmap.controlPoints.add(point[0], point[1]);
        }
    }

    private overallDifficultyToMs(od: number) {
        return -6.0 * od + 79.5;
    }

    private msToOverallDifficulty(ms: number) {
        return (79.5 - ms) / 6.0;
    }

    private calculateMultipliedOD(): number {
        const newbpmMs: number =
            this.overallDifficultyToMs(this.beatmap.difficulty.overallDifficulty) / this.rate;

        let newbpmOD: number = this.msToOverallDifficulty(newbpmMs);

        newbpmOD = Math.round(newbpmOD * 10) / 10;

        return this.clamp(newbpmOD, 0, 11);
    }

    private calculateMultipliedAR(): number {
        const newbpmMs: number =
            this.approachRateToMs(this.beatmap.difficulty.approachRate) / this.rate;
        const newbpmAR: number = this.msToApproachRate(newbpmMs);
        return this.clamp(newbpmAR, 0, 11);
    }

    private approachRateToMs(approachRate: number): number {
        if (approachRate <= 5) {
            return 1800.0 - approachRate * 120.0;
        } else {
            const remainder: number = approachRate - 5;
            return 1200.0 - remainder * 150.0;
        }
    }

    private msToApproachRate(ms: number): number {
        let smallestDiff: number = 100_000.0;

        for (let AR = 0; AR <= 110; AR++) {
            const newDiff = Math.abs(this.approachRateToMs(AR / 10.0) - ms);
            if (newDiff < smallestDiff) {
                smallestDiff = newDiff;
            } else {
                return (AR - 1) / 10.0;
            }
        }

        return 300;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
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
