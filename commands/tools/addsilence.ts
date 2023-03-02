import { SlashCommand } from "../../models/commands/SlashCommand";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { unlinkSync, readFileSync, mkdirSync, existsSync } from "fs";
import crypto from "crypto";
import { AttachmentBuilder } from "discord.js";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbedWithTitle from "../../helpers/text/embeds/generateErrorEmbedWithTitle";
import generateWaitEmbed from "../../helpers/text/embeds/generateWaitEmbed";

const addsilent = new SlashCommand(
    ["addsilence", "silentbegin"],
    "Add a silent begin to an audio file",
    "Tools",
    true,
    {
        "Allowed files": ["`mp3`", "`ogg`"],
    }
);

addsilent.builder
    .addAttachmentOption((o) =>
        o
            .setName("audio")
            .setRequired(true)
            .setDescription("Audio file to manage")
    )
    .addNumberOption((o) =>
        o
            .setName("duration")
            .setDescription("Duration of the silent section (in seconds)")
            .setRequired(true)
            .setMinValue(0.1)
            .setMaxValue(2.0)
    );

addsilent.setExecuteFunction(async (command) => {
    try {
        const attachment = command.options.getAttachment("audio", true);
        const duration = command.options.getNumber("duration", true);

        if (duration > 5)
            return command.editReply({
                embeds: [generateErrorEmbed("Max delay is `5 seconds`!")],
            });

        if (
            !["audio/mpeg", "audio/ogg"].includes(
                attachment.contentType || "unknown"
            )
        )
            return command.editReply({
                embeds: [generateErrorEmbed("Max delay is `5 seconds`!")],
            });

        await command.editReply({
            embeds: [
                generateWaitEmbed(
                    "Please wait...",
                    "Adding delay to your audio..."
                ),
            ],
        });

        const fileId = crypto.randomBytes(10).toString("hex");
        const filename = `${fileId}_${attachment.name}`;

        const f = ffmpeg(attachment.url);
        if (process.platform == "win32") {
            f.setFfmpegPath(path.resolve("./bin/ffmpeg.exe"));
        }

        f.audioFilters([
            {
                filter: "adelay",
                options: `delays=${duration}s:all=true`,
            },
        ]).saveToFile(path.resolve(`./temp/audios/${filename}`));

        f.on("end", async () => {
            const audio = readFileSync(
                path.resolve(`./temp/audios/${filename}`)
            );

            const audioAttachment = new AttachmentBuilder(audio, {
                name: attachment.name || filename,
            });

            return command
                .editReply({
                    embeds: [
                        generateSuccessEmbed(
                            `Added \`${duration} seconds\` of delay at the beginning of your audio`
                        ),
                    ],
                    files: [audioAttachment],
                })
                .then(() => {
                    unlinkSync(path.resolve(`./temp/audios/${filename}`));
                });
        });

        f.on("error", (e) => {
            console.log(e);

            command.editReply({
                embeds: [
                    generateErrorEmbedWithTitle(
                        "Something went wrong!",
                        `\`${e}\``
                    ),
                ],
            });
        });
    } catch (e) {
        console.error(e);

        command.editReply({
            embeds: [
                generateErrorEmbedWithTitle(
                    "Something went wrong!",
                    `Sorry... Try again later...`
                ),
            ],
        });
    }
});

export default addsilent;
