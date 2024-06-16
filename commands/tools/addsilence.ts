import { SlashCommand } from "../../models/commands/SlashCommand";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { unlinkSync, readFileSync, mkdirSync, existsSync } from "fs";
import crypto from "crypto";
import {
    AttachmentBuilder,
    SlashCommandAttachmentOption,
    SlashCommandStringOption,
} from "discord.js";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbedWithTitle from "../../helpers/text/embeds/generateErrorEmbedWithTitle";
import generateWaitEmbed from "../../helpers/text/embeds/generateWaitEmbed";
import { spawn } from "child_process";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const addsilent = new SlashCommand()
    .setName("addsilence")
    .setNameAliases("silentbegin")
    .setDescription("Add a silent begin to an audio file")
    .setCategory(CommandCategory.Tools)
    .setDMPermission(true)
    .setHelp({
        "Allowed files": ["`mp3`"],
    })
    .addOptions(
        new SlashCommandAttachmentOption()
            .setName("audio")
            .setRequired(true)
            .setDescription("Audio file to manage"),
        new SlashCommandStringOption()
            .setName("duration")
            .setDescription("Duration of the silent section (Ex: 200ms or 2s)")
            .setRequired(true)
    );

addsilent.setExecutable(async (command) => {
    try {
        const attachment = command.options.getAttachment("audio", true);
        const durationInput = command.options
            .getString("duration", true)
            .replace(/ /g, "")
            .replace(/-/g, "")
            .trim()
            .toLowerCase();

        const availableScales = ["ms", "s"];
        let audioScale = String(durationInput).slice(-2);

        // This will validate seconds input
        if (!isNaN(Number(audioScale[0]))) audioScale = String(durationInput).slice(-1);

        if (!availableScales.includes(audioScale))
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        "Invalid input format! It should be `[number][scale]`. Example: `200ms` or `2s`"
                    ),
                ],
            });

        const duration = Number(durationInput.replace(audioScale, ""));
        const decimalDuration = Number(audioScale == "ms" ? Math.floor(duration / 1000) : duration);

        if (isNaN(duration))
            return command.editReply({
                embeds: [
                    generateErrorEmbed(
                        "Invalid input format! It should be `[number][scale]`. Example: `200ms` or `2s`"
                    ),
                ],
            });

        if (decimalDuration > 5)
            return command.editReply({
                embeds: [generateErrorEmbed("Max delay is `5 seconds`!")],
            });

        if (!["audio/mpeg"].includes(attachment.contentType || "unknown"))
            return command.editReply({
                embeds: [
                    generateErrorEmbed("Invalid audio type! Allowed types are `mp3` and `ogg`!"),
                ],
            });

        await command.editReply({
            embeds: [generateWaitEmbed("Please wait...", "Adding delay to your audio...")],
        });

        const fileId = crypto.randomBytes(10).toString("hex");
        const filename = `${fileId}_${attachment.name}`;

        const ffprobe = spawn("ffprobe", [
            "-v",
            "error",
            "-show_entries",
            "format=bit_rate",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            attachment.url,
        ]);

        ffprobe.on("error", (error) => {
            console.error(error);

            command.editReply({
                embeds: [generateErrorEmbedWithTitle("Something went wrong!", `\`${error}\``)],
            });
        });

        ffprobe.stdout.on("data", (data) => {
            const audioBitRate = parseInt(data.toString().trim());

            const f = ffmpeg(attachment.url);

            if (process.platform == "win32") {
                f.setFfmpegPath(path.resolve("./bin/ffmpeg.exe"));
            }

            f.audioFilters([
                {
                    filter: "adelay",
                    options: `delays=${durationInput}:all=true`,
                },
            ])
                .audioBitrate(`${Math.round(audioBitRate / 1000)}k`)
                .saveToFile(path.resolve(`./temp/audios/${filename}`))
                .on("end", async () => {
                    const audio = readFileSync(path.resolve(`./temp/audios/${filename}`));

                    const audioAttachment = new AttachmentBuilder(audio, {
                        name: attachment.name || filename,
                    });

                    return command
                        .editReply({
                            embeds: [
                                generateSuccessEmbed(
                                    `Added \`${durationInput}\` of delay at the beginning of your audio`
                                ),
                            ],
                            files: [audioAttachment],
                        })
                        .then(() => {
                            unlinkSync(path.resolve(`./temp/audios/${filename}`));
                        });
                });

            f.on("error", (e) => {
                console.error(e);

                command.editReply({
                    embeds: [generateErrorEmbedWithTitle("Something went wrong!", `\`${e}\``)],
                });
            });
        });
    } catch (e) {
        console.error(e);

        command.editReply({
            embeds: [
                generateErrorEmbedWithTitle("Something went wrong!", `Sorry... Try again later...`),
            ],
        });
    }
});

export { addsilent };
