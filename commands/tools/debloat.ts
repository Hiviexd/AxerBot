import { SlashCommand } from "../../models/commands/SlashCommand";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { unlinkSync, readFileSync, mkdirSync, existsSync } from "fs";
import crypto from "crypto";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import colors from "../../constants/colors";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";

const debloat = new SlashCommand(
    ["debloat", "reencode"],
    "Re-encode an mp3 with a different bitrate",
    "Tools",
    true
);

debloat.builder
    .addAttachmentOption((o) =>
        o
            .setName("audio")
            .setDescription("Audio file to re-encode")
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("target_bitrate")
            .setDescription("Target bitrate")
            .setRequired(true)
            .addChoices(
                {
                    name: "192kbps",
                    value: "192k",
                },
                {
                    name: "160kbps",
                    value: "160k",
                },
                {
                    name: "144kbps",
                    value: "144k",
                },
                {
                    name: "128kbps",
                    value: "128k",
                }
            )
    );

debloat.setExecuteFunction(async (command) => {
    const attachment = command.options.getAttachment("audio", true);
    const bitrate = command.options.getString("target_bitrate", true);

    if (!attachment.attachment) return;

    const mimes = ["audio/mpeg"];

    const mimeNames: { [key: string]: string } = {
        "audio/mpeg": "mp3",
    };

    if (
        !mimes.includes(attachment.contentType || "") ||
        !attachment.contentType
    )
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    `Invalid audio type! Audio type must be \`mp3\``
                ),
            ],
        });

    if (attachment.size > 1e7)
        return command.editReply({
            embeds: [generateErrorEmbed(`Max file size must be 15mb or less!`)],
        });

    const progressEmbed = new EmbedBuilder()
        .setDescription("Re-encoding audio... This can take a while...")
        .setColor(colors.yellowBright);

    command.editReply({
        embeds: [progressEmbed],
    });

    if (!existsSync(path.resolve(`./temp/debloater/`)))
        mkdirSync(path.resolve(`./temp/debloater/`));

    try {
        const audioFile = await axios(attachment.url, {
            responseType: "stream",
        });

        const fileId = crypto.randomBytes(10).toString("hex");
        const filename = `${fileId}.${mimeNames[attachment.contentType]}`;

        const f = ffmpeg(audioFile.data);
        if (process.platform == "win32") {
            f.setFfmpegPath(path.resolve("./bin/ffmpeg.exe"));
        }
        f.audioBitrate(bitrate).saveToFile(
            path.resolve(`./temp/debloater/${filename}`)
        );

        f.on("end", () => {
            if (!attachment.contentType) return;

            const file = readFileSync(
                path.resolve(`./temp/debloater/${filename}`)
            );

            const result = new AttachmentBuilder(file, {
                name: `${attachment.name}`,
            });

            command
                .editReply({
                    embeds: [
                        generateSuccessEmbed(
                            `Audio re-encoded to \`${bitrate}bps\`!`
                        ),
                    ],
                    files: [result],
                })
                .then(() => {
                    unlinkSync(path.resolve(`./temp/debloater/${filename}`));
                });
        });
    } catch (e) {
        console.error(e);
        command.editReply({
            embeds: [generateErrorEmbed("Something went wrong...")],
        });
    }
});

export default debloat;
