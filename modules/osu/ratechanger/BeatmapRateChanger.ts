import { randomBytes } from "crypto";
import {
    createWriteStream,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rename,
    statSync,
    writeFileSync,
} from "fs";
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

    generate() {
        return new Promise<string>((resolve, reject) => {
            const encoder = new BeatmapEncoder();

            this.scaleTimingPoints();
            this.scaleObjects();
            this.changeMetadata();
            this.scaleDifficulty();

            this.createFolders();

            this.changeAudioRate()
                .then(() => {
                    const output =
                        `${this.beatmap.metadata.artist} - ${this.beatmap.metadata.title} (${this.beatmap.metadata.creator}) [${this.beatmap.metadata.version}]`
                            .replace(/\\/g, " ")
                            .replace(/\//g, "");

                    encoder.encodeToPath(path.join(this.tempPath, output), this.beatmap);

                    resolve(this.fileHash);
                })
                .catch(reject);
        });
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
                    .replace(/\//g, "");

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

            if (point.pointType == ControlPointType.TimingPoint) {
                (newTimingPoint as TimingPoint).timeSignature = (
                    point as TimingPoint
                ).timeSignature;
                (newTimingPoint as TimingPoint).beatLength =
                    (point as TimingPoint).beatLength / this.rate;
            }

            if (point.pointType == ControlPointType.EffectPoint) {
                (newTimingPoint as EffectPoint).kiai = (point as EffectPoint).kiai;
                (newTimingPoint as EffectPoint).omitFirstBarLine = (
                    point as EffectPoint
                ).omitFirstBarLine;
                (newTimingPoint as EffectPoint).scrollSpeed = (point as EffectPoint).scrollSpeed;
            }

            if (point.pointType == ControlPointType.DifficultyPoint) {
                (newTimingPoint as DifficultyPoint).sliderVelocity = (
                    point as DifficultyPoint
                ).sliderVelocity;
                (newTimingPoint as DifficultyPoint).bpmMultiplier = (
                    point as DifficultyPoint
                ).bpmMultiplier;
            }

            if (point.pointType == ControlPointType.SamplePoint) {
                (newTimingPoint as SamplePoint).volume = (point as SamplePoint).volume;
                (newTimingPoint as SamplePoint).customIndex = (point as SamplePoint).customIndex;
                (newTimingPoint as SamplePoint).sampleSet = (point as SamplePoint).sampleSet;
                (newTimingPoint as SamplePoint).customIndex = (point as SamplePoint).customIndex;
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

    calculateMultipliedAR(): number {
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
