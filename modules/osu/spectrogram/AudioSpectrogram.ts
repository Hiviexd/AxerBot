import { exec, spawn } from "child_process";
import { randomBytes } from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import truncateString from "../../../helpers/text/truncateString";

export class AudioSpectrogram {
    public audio: Buffer;
    public fileId: string = randomBytes(20).toString("hex");
    private FFMPEG_PATH = path.resolve("./bin/ffmpeg.exe");
    private FFPROBE_PATH = path.resolve("./bin/ffprobe.exe");
    private staticImagePathBase = path.resolve(`./temp/spectro/images/`);
    private staticAudioPathBase = path.resolve(`./temp/spectro/audio/`);
    private ffmpeg = Ffmpeg;

    constructor(audio: Buffer) {
        this.audio = audio;

        if (process.platform == "win32") {
            this.ffmpeg.setFfmpegPath(this.FFMPEG_PATH);
            this.ffmpeg.setFfprobePath(this.FFPROBE_PATH);
        }
    }

    private saveAudioFile() {
        writeFileSync(this.audioFilePath(), this.audio);
    }

    private audioFilePath() {
        return path.join(this.staticAudioPathBase, `${this.fileId}.mp3`);
    }

    private imageFilePath() {
        return path.join(this.staticImagePathBase, `${this.fileId}.png`);
    }

    validatePaths() {
        if (!existsSync(this.staticImagePathBase)) mkdirSync(this.staticImagePathBase);

        if (!existsSync(this.staticAudioPathBase)) mkdirSync(this.staticAudioPathBase);
    }

    deleteFiles() {
        try {
            unlinkSync(this.imageFilePath());
            unlinkSync(this.audioFilePath());
        } catch (e) {}
    }

    generate() {
        this.validatePaths();
        this.saveAudioFile();

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn("ffmpeg", [
                "-i",
                this.audioFilePath(),
                "-lavfi",
                "showspectrumpic=s=1280x720:mode=combined:color=cool",
                "-frames:v",
                "1",
                this.imageFilePath(),
            ]);

            ffmpeg.on("close", (code) => {
                if (code === 0) {
                    resolve({ path: this.imageFilePath(), id: this.fileId });
                } else {
                    reject("ffmpeg closed with code 1");
                    console.error(`ffmpeg process exited with code ${code}`);
                }
            });

            ffmpeg.stderr.on("data", (e) => console.error(e.toString()));

            ffmpeg.on("error", (err) => {
                return reject(truncateString(err.toString(), 4080));
            });
        }) as Promise<{ path: string; id: string }>;
    }
}
