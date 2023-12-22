// /**
//  *         const f = ffmpeg(audioFile.data);

import { exec } from "child_process";
import { randomBytes } from "crypto";
import Ffmpeg from "fluent-ffmpeg";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import internal from "stream";

//         if (process.platform == "win32") {
//             f.setFfmpegPath();
//         }

//         f.toFormat("wav");

//         f.on("codecData", function (codecinfo) {
//             bitrate = codecinfo.audio_details[4];
//         })

//             .save(`./temp/spectro/audio/${fileId}.wav`)
//             .on("error", (err) => {
//                 console.log("An error occurred: " + err.message);
//             })
//             .on("end", (d) => {
//                 const pythonProcess = spawn("python3", [
//                     "./helpers/audio/spectrogram.py",
//                     `${fileId}.wav`,
//                     bitrate,
//                 ]);

//                 pythonProcess.on("exit", async () => {
//                     const image = readFileSync(
//                         path.resolve(`./temp/spectro/images/${fileId}.png`)
//                     );

//                     const attachment = new AttachmentBuilder(image, {
//                         name: "image.jpg",
//                     });

//                     const successEmbed = new EmbedBuilder()
//                         .setTitle("📉 Spectro")
//                         .setDescription(
//                             `Spectro for \`${audioFileData.name}\` generated!`
//                         )
//                         .setImage("attachment://image.jpg")
//                         .setColor(colors.blue);

//                     const guideButton = new ButtonBuilder()
//                         .setLabel("How to read spectrograms")
//                         .setStyle(ButtonStyle.Link)
//                         .setURL(
//                             "https://github.com/AxerBot/axer-bot/wiki/Spectrogram-Guide"
//                         );

//                     const row =
//                         new ActionRowBuilder<ButtonBuilder>().addComponents(
//                             guideButton
//                         );

//                     command
//                         .editReply({
//                             embeds: [successEmbed],
//                             files: [attachment],
//                             components: [row],
//                         })
//                         .then(() => {
//                             setTimeout(() => {
//                                 unlinkSync(
//                                     path.resolve(
//                                         `./temp/spectro/images/${fileId}.png`
//                                     )
//                                 );
//                                 unlinkSync(
//                                     path.resolve(
//                                         `./temp/spectro/audio/${fileId}.wav`
//                                     )
//                                 );
//                             }, 10000);
//                         });
//                 });
//             });
//  */

// import path from "path";
// import ffmpeg, { FfprobeData, ffprobe } from "fluent-ffmpeg";
// import { Readable } from "stream";
// import {
//     existsSync,
//     mkdirSync,
//     readFileSync,
//     unlinkSync,
//     writeFileSync,
// } from "fs";
// import crypto from "crypto";
// import { exec } from "child_process";
// import { EventEmitter } from "events";
// import { TextBasedChannel, AttachmentBuilder } from "discord.js";
// import { bot } from "../../..";
// import { streamToBuffer } from "../../../helpers/transform/streamToBuffer";

// export class AudioSpectrogram extends EventEmitter {
//     private FFMPEG_PATH = path.resolve("./bin/ffmpeg.exe");
//     private FFPROBE_PATH = path.resolve("./bin/ffprobe.exe");
//     private StaticImagePathBase = path.resolve(`./temp/spectro/images/`);
//     private StaticAudioPathBase = path.resolve(`./temp/spectro/audio/`);
//     private PythonModule = "./helpers/audio/spectrogram.py";
//     private FFMPEG = ffmpeg;
//     private FileId!: string;
//     private Audio!: Readable;
//     private AudioBuffer!: Buffer | null;
//     private Image!: Buffer;

//     constructor() {
//         super();

//         if (process.platform == "win32") {
//             this.FFMPEG.setFfmpegPath(this.FFMPEG_PATH);
//             this.FFMPEG.setFfprobePath(this.FFPROBE_PATH);
//         }

//         this.validatePaths();
//         this.generateId();
//     }

//     public static isMimeValid(mimetype: string | null) {
//         if (!mimetype) return false;

//         const validTypes = [
//             "audio/mpeg",
//             "audio/ogg",
//             "audio/x-wav",
//             "audio/wav",
//         ];

//         return validTypes.includes(mimetype);
//     }

//     public static isFileSizeValid(bytes: number | null) {
//         if (!bytes) return false;

//         return bytes <= 1.5e7;
//     }

//     setAudio(audio: Readable) {
//         this.Audio = audio;

//         streamToBuffer(this.Audio)
//             .then((buffer) => {
//                 this.AudioBuffer = buffer;
//             })
//             .catch((e) => {
//                 this.AudioBuffer = null;
//             });

//         return this;
//     }

//     getAudioInfo(): Promise<FfprobeData | null> {
//         return new Promise((resolve, reject) => {
//             if (!this.AudioBuffer) return resolve(null);

//             writeFileSync(
//                 path.join(
//                     this.getAudioStaticPathBase(),
//                     this.getFileId().concat(".default")
//                 ),
//                 this.AudioBuffer
//             );

//             ffprobe(
//                 path.join(
//                     this.getAudioStaticPathBase(),
//                     this.getFileId().concat(".default")
//                 ),
//                 (err, data) => {
//                     if (err) {
//                         console.log(err);
//                         unlinkSync(
//                             path.join(
//                                 this.getAudioStaticPathBase(),
//                                 this.getFileId().concat(".default")
//                             )
//                         );
//                         return resolve(null);
//                     }

//                     resolve(data);

//                     unlinkSync(
//                         path.join(
//                             this.getAudioStaticPathBase(),
//                             this.getFileId().concat(".default")
//                         )
//                     );
//                 }
//             );
//         });
//     }

//     public async getBitRate() {
//         const audioData = await this.getAudioInfo();

//         if (!audioData) return "Unknown";

//         const sanitizedBitRate = Math.round(
//             Number(audioData.format.bit_rate) / 1000
//         );

//         const result = audioData.format.bit_rate
//             ? `${!isNaN(sanitizedBitRate) ? sanitizedBitRate : "Unknown"}Kb/s`
//             : "Unknown";

//         return result;
//     }

//     private getFileId() {
//         return this.FileId;
//     }

//     private getImageStaticPathBase() {
//         return this.StaticImagePathBase;
//     }

//     private getAudioStaticPathBase() {
//         return this.StaticAudioPathBase;
//     }

//     start() {
//         this.FFMPEG.bind(this);
//         this.startPythonProcess.bind(this);
//         this.getBitRate.bind(this);
//         this.getFileId.bind(this);
//         this.getImageStaticPathBase.bind(this);
//         this.getAudioStaticPathBase.bind(this);

//         this.FFMPEG(this.Audio)
//             .toFormat("wav")
//             .saveToFile(
//                 path.join(
//                     this.getAudioStaticPathBase(),
//                     this.getFileId().concat(".wav")
//                 )
//             )
//             .on("end", this.startPythonProcess.bind(this));
//     }

//     private setImage(image: Buffer) {
//         this.Image = image;
//     }

//     private getImage() {
//         return this.Image;
//     }

//     private async startPythonProcess() {
//         this.emit.bind(this);
//         this.getFileId.bind(this);
//         this.getAudioStaticPathBase.bind(this);
//         this.getImageStaticPathBase.bind(this);
//         this.setImage.bind(this);

//         exec(
//             `python3 ${this.PythonModule} ${this.getFileId().concat(
//                 ".wav"
//             )} ${await this.getBitRate()}`,
//             (error, stdout, stderr) => {
//                 if (error !== null) return this.emit("error", error);

//                 this.setImage(
//                     readFileSync(
//                         path.join(
//                             this.getImageStaticPathBase(),
//                             this.getFileId().concat(".png")
//                         )
//                     )
//                 );

//                 this.emit("data", this.getImage());

//                 unlinkSync(
//                     path.join(
//                         this.getAudioStaticPathBase(),
//                         this.getFileId().concat(".wav")
//                     )
//                 );

//                 unlinkSync(
//                     path.join(
//                         this.getImageStaticPathBase(),
//                         this.getFileId().concat(".png")
//                     )
//                 );
//             }
//         );
//     }

//     generateId() {
//         return (this.FileId = crypto.randomBytes(10).toString("hex"));
//     }

//     async generateDiscordPermalink() {
//         try {
//             const guild = bot.guilds.cache.get(
//                 process.env.CACHE_DISCORD_GUILD || ""
//             );

//             if (!guild) return null;

//             const channel = guild.channels.cache.get(
//                 process.env.CACHE_DISCORD_CHANNEL || ""
//             ) as TextBasedChannel | undefined;

//             if (!channel) return null;
//             const attachment = new AttachmentBuilder(this.getImage(), {
//                 name: "spectro.png",
//             });

//             const message = await channel.send({
//                 files: [attachment],
//             });

//             const firstAttachment = message.attachments.first();
//             if (!firstAttachment) return null;

//             return firstAttachment.url;
//         } catch (e) {
//             console.error(e);

//             return null;
//         }
//     }
// }

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
            const command = `ffmpeg -i ${this.audioFilePath()} -lavfi showspectrumpic=s=960x540:orientation=0 ${this.imageFilePath()}`;

            exec(command, (error, stdout) => {
                if (error) return reject();

                return resolve({ path: this.imageFilePath(), id: this.fileId });
            });
        }) as Promise<{ path: string; id: string }>;
    }
}
