import axios from "axios";
import {
    ActionRowBuilder,
    ApplicationCommandType,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

import colors from "../../../constants/colors";
import generateErrorEmbed from "../../../helpers/text/embeds/generateErrorEmbed";
import {
    ContextMenuCommand,
    ContextMenuType,
} from "../../../models/commands/ContextMenuCommand";
import { AudioSpectrogram } from "../../../modules/osu/spectrogram/AudioSpectrogram";

export default new ContextMenuCommand<ContextMenuType.Message>()
    .setName("Generate Spectrogram")
    .setType(ApplicationCommandType.Message)
    .setEphemeral(true)
    .setModal(false)
    .setExecuteFunction(async (command) => {
        try {
            const targetAudio = command.targetMessage.attachments.find(
                (attachment) =>
                    AudioSpectrogram.isMimeValid(attachment.contentType) &&
                    AudioSpectrogram.isFileSizeValid(attachment.size)
            );

            if (!targetAudio)
                return command.editReply({
                    embeds: [
                        generateErrorEmbed(
                            "This message doesn't have any valid audio file"
                        ),
                    ],
                });

            const progressEmbed = new EmbedBuilder()
                .setDescription("Generating spectro, this can take a while...")
                .setColor(colors.yellowBright);

            await command.editReply({
                embeds: [progressEmbed],
            });

            const targetAudioData = await axios(targetAudio.url, {
                responseType: "stream",
            });

            const spectro = new AudioSpectrogram();
            spectro.setAudio(targetAudioData.data);
            spectro.start();
            spectro.on("data", (image) => {
                const resultImage = new AttachmentBuilder(image, {
                    name: "spectro.png",
                });

                const resultEmbed = new EmbedBuilder()
                    .setTitle("📉 Spectro")
                    .setDescription(
                        `Spectro for \`${targetAudio.name}\` generated!`
                    )
                    .setImage("attachment://spectro.png")
                    .setColor(colors.blue);

                const guideButton = new ButtonBuilder()
                    .setLabel("How to read spectrograms")
                    .setStyle(ButtonStyle.Link)
                    .setURL(
                        "https://github.com/AxerBot/axer-bot/wiki/Spectrogram-Guide"
                    );

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    guideButton
                );

                command.editReply({
                    embeds: [resultEmbed],
                    files: [resultImage],
                    components: [row],
                });
            });
        } catch (e) {
            console.error();

            command.editReply({
                embeds: [generateErrorEmbed("Something went wrong...")],
            });
        }
    });
