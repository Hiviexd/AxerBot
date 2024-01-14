import axios from "axios";
import { ExecException, spawn } from "child_process";
import crypto from "crypto";
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

import colors from "../../constants/colors";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import generateErrorEmbedWithTitle from "../../helpers/text/embeds/generateErrorEmbedWithTitle";
import truncateString from "../../helpers/text/truncateString";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { AudioSpectrogram } from "../../modules/osu/spectrogram/AudioSpectrogram";
import { readFileSync } from "fs";
import { FFProbe } from "../../modules/audio/FFProbe";

const spectrum = new SlashCommand(
    "spectro",
    "Generate a frequency spectrogram from an audio file.",
    "Tools",
    true
);

spectrum.builder.addAttachmentOption((o) =>
    o.setName("audio").setDescription("Audio file").setRequired(true)
);

spectrum.setExecuteFunction(async (command) => {
    const audioFileData = command.options.getAttachment("audio", true);

    const mimes = ["audio/ogg", "audio/wav", "audio/x-wav", "audio/mpeg"];

    if (!mimes.includes(audioFileData.contentType || ""))
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    `Invalid audio type! Audio type must be ${mimes
                        .map((m) => `\`${m}\``)
                        .join(", ")}`
                ),
            ],
        });

    if (audioFileData.size > 1.5e7)
        return command.editReply({
            embeds: [generateErrorEmbed(`Max file size must be 15mb or less!`)],
        });

    const audioFile = await axios(audioFileData.url, {
        responseType: "arraybuffer",
    });

    const progressEmbed = new EmbedBuilder()
        .setDescription("Generating spectro, this can take a while...")
        .setColor(colors.yellowBright);

    command.editReply({
        embeds: [progressEmbed],
    });

    const Spectro = new AudioSpectrogram(audioFile.data);

    const ffprobe = spawn("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=bit_rate",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        audioFileData.url,
    ]);

    ffprobe.on("error", (error) => {
        console.error(error);

        command.editReply({
            embeds: [generateErrorEmbedWithTitle("Something went wrong!", `\`${error}\``)],
        });
    });

    const audioProperties = await new FFProbe(audioFileData.url).getAudioProperties();

    Spectro.generate()
        .then((file) => {
            const image = readFileSync(file.path);

            const attachment = new AttachmentBuilder(image, {
                name: "image.jpg",
            });

            const successEmbed = new EmbedBuilder()
                .setTitle("📉 Spectro")
                .setDescription(`Spectro for \`${audioFileData.name}\` generated!`)
                .addFields(
                    {
                        name: "Bit Rate",
                        value: `${Math.round(audioProperties.bitRate / 1000)}kbps`,
                        inline: true,
                    },
                    {
                        name: "Sample Rate",
                        value: `${Math.round(audioProperties.sampleRate)}Hz`,
                        inline: true,
                    }
                )
                .setImage("attachment://image.jpg")
                .setColor(colors.blue);
            const guideButton = new ButtonBuilder()
                .setLabel("How to read spectrograms")
                .setStyle(ButtonStyle.Link)
                .setURL("https://github.com/AxerBot/axer-bot/wiki/Spectrogram-Guide");
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(guideButton);

            command
                .editReply({
                    embeds: [successEmbed],
                    files: [attachment],
                    components: [row],
                })
                .then(() => Spectro.deleteFiles())
                .catch(() => Spectro.deleteFiles());
        })
        .catch((error) => {
            Spectro.deleteFiles();
            console.error(error);

            command.editReply({
                embeds: [
                    generateErrorEmbedWithTitle(
                        ":x: Something went wrong!",
                        `${error?.message || "**Error:**"}\n${truncateString(
                            error?.stack || "",
                            4096
                        )}`
                    ),
                ],
            });
        });
    try {
    } catch (e) {
        console.error(e);
        return command.editReply({
            embeds: [generateErrorEmbed("Something went wrong! Try again.")],
        });
    }
});

export default spectrum;
