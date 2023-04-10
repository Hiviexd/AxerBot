/**
 *         const f = ffmpeg(audioFile.data);

        if (process.platform == "win32") {
            f.setFfmpegPath();
        }

        f.toFormat("wav");

        f.on("codecData", function (codecinfo) {
            bitrate = codecinfo.audio_details[4];
        })

            .save(`./temp/spectro/audio/${fileId}.wav`)
            .on("error", (err) => {
                console.log("An error occurred: " + err.message);
            })
            .on("end", (d) => {
                const pythonProcess = spawn("python3", [
                    "./helpers/audio/spectrogram.py",
                    `${fileId}.wav`,
                    bitrate,
                ]);

                pythonProcess.on("exit", async () => {
                    const image = readFileSync(
                        path.resolve(`./temp/spectro/images/${fileId}.png`)
                    );

                    const attachment = new AttachmentBuilder(image, {
                        name: "image.jpg",
                    });

                    const successEmbed = new EmbedBuilder()
                        .setTitle("📉 Spectro")
                        .setDescription(
                            `Spectro for \`${audioFileData.name}\` generated!`
                        )
                        .setImage("attachment://image.jpg")
                        .setColor(colors.blue);

                    const guideButton = new ButtonBuilder()
                        .setLabel("How to read spectrograms")
                        .setStyle(ButtonStyle.Link)
                        .setURL(
                            "https://github.com/AxerBot/axer-bot/wiki/Spectrogram-Guide"
                        );

                    const row =
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            guideButton
                        );

                    command
                        .editReply({
                            embeds: [successEmbed],
                            files: [attachment],
                            components: [row],
                        })
                        .then(() => {
                            setTimeout(() => {
                                unlinkSync(
                                    path.resolve(
                                        `./temp/spectro/images/${fileId}.png`
                                    )
                                );
                                unlinkSync(
                                    path.resolve(
                                        `./temp/spectro/audio/${fileId}.wav`
                                    )
                                );
                            }, 10000);
                        });
                });
            });
 */

import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "fs";
import crypto from "crypto";
import { exec } from "child_process";
import { EventEmitter } from "events";
import { TextBasedChannel, AttachmentBuilder } from "discord.js";
import { bot } from "../../..";

export class AudioSpectrogram extends EventEmitter {
    private FFMPEG_PATH = path.resolve("./bin/ffmpeg.exe");
    private StaticImagePathBase = path.resolve(`./temp/spectro/images/`);
    private StaticAudioPathBase = path.resolve(`./temp/spectro/audio/`);
    private PythonModule = "./helpers/audio/spectrogram.py";
    private FFMPEG = ffmpeg;
    private FileId!: string;
    private Audio!: Readable | string;
    private Image!: Buffer;
    private BitRate!: number;

    constructor() {
        super();

        if (process.platform == "win32") {
            this.FFMPEG.setFfmpegPath(this.FFMPEG_PATH);
        }

        this.validatePaths();
        this.generateId();
    }

    setAudio(audio: string | Readable) {
        this.Audio = audio;
    }

    private setBitRate(value: number) {
        this.BitRate = value;
    }

    private getBitRate() {
        return this.BitRate;
    }

    private getFileId() {
        return this.FileId;
    }

    private getImageStaticPathBase() {
        return this.StaticImagePathBase;
    }

    private getAudioStaticPathBase() {
        return this.StaticAudioPathBase;
    }

    start() {
        this.FFMPEG.bind(this);
        this.startPythonProcess.bind(this);
        this.setBitRate.bind(this);
        this.getFileId.bind(this);
        this.getImageStaticPathBase.bind(this);
        this.getAudioStaticPathBase.bind(this);

        this.FFMPEG(this.Audio)
            .toFormat("wav")
            .saveToFile(
                path.join(
                    this.getAudioStaticPathBase(),
                    this.getFileId().concat(".wav")
                )
            )
            .on("codecData", (codecinfo) => {
                this.setBitRate(codecinfo.audio_details[4]);
            })
            .on("end", this.startPythonProcess.bind(this));
    }

    private setImage(image: Buffer) {
        this.Image = image;
    }

    private getImage() {
        return this.Image;
    }

    private startPythonProcess() {
        this.emit.bind(this);
        this.getFileId.bind(this);
        this.getAudioStaticPathBase.bind(this);
        this.getImageStaticPathBase.bind(this);
        this.setImage.bind(this);

        exec(
            `python3 ${this.PythonModule} ${this.getFileId().concat(
                ".wav"
            )} ${this.getBitRate()}kb/s`,
            (error, stdout, stderr) => {
                if (error !== null) return this.emit("error", error);

                this.setImage(
                    readFileSync(
                        path.join(
                            this.getImageStaticPathBase(),
                            this.getFileId().concat(".png")
                        )
                    )
                );

                this.emit("data");

                unlinkSync(
                    path.join(
                        this.getAudioStaticPathBase(),
                        this.getFileId().concat(".wav")
                    )
                );

                unlinkSync(
                    path.join(
                        this.getImageStaticPathBase(),
                        this.getFileId().concat(".png")
                    )
                );
            }
        );
    }

    generateId() {
        return (this.FileId = crypto.randomBytes(10).toString("hex"));
    }

    validatePaths() {
        if (!existsSync(this.getImageStaticPathBase()))
            mkdirSync(this.getImageStaticPathBase());

        if (!existsSync(this.getAudioStaticPathBase()))
            mkdirSync(this.getAudioStaticPathBase());
    }

    async generateDiscordPermalink() {
        try {
            const guild = bot.guilds.cache.get(
                process.env.CACHE_DISCORD_GUILD || ""
            );

            if (!guild) return null;

            const channel = guild.channels.cache.get(
                process.env.CACHE_DISCORD_CHANNEL || ""
            ) as TextBasedChannel | undefined;

            if (!channel) return null;
            const attachment = new AttachmentBuilder(this.getImage(), {
                name: "spectro.png",
            });

            const message = await channel.send({
                files: [attachment],
            });

            const firstAttachment = message.attachments.first();
            if (!firstAttachment) return null;

            return firstAttachment.url;
        } catch (e) {
            console.error(e);

            return null;
        }
    }
}
