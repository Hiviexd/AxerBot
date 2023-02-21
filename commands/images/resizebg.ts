import { Image, createCanvas, loadImage } from "canvas";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import Jimp from "jimp";
import { AttachmentBuilder } from "discord.js";

export const resizebg = new SlashCommand(
    "resizebg",
    "Transform a square image to a 16:9 image",
    "images",
    true
);

resizebg.builder
    .addAttachmentOption((o) =>
        o.setName("base").setDescription("Image to resize").setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("base_size")
            .setDescription("Base image size to cover the canvas")
            .addChoices(
                {
                    name: "80%",
                    value: "0.8",
                },
                {
                    name: "70%",
                    value: "0.7",
                },
                {
                    name: "60%",
                    value: "0.6",
                },
                {
                    name: "50%",
                    value: "0.5",
                },
                {
                    name: "40%",
                    value: "0.4",
                }
            )
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("output_size")
            .setDescription("Output image size")
            .addChoices(
                {
                    name: "1920x1080",
                    value: "1920,1080",
                },
                {
                    name: "1280x720",
                    value: "1280,720",
                }
            )
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("shadow_size")
            .setDescription("Overlay image shadow size")
            .addChoices(
                {
                    name: "Small",
                    value: "small",
                },
                {
                    name: "Medium",
                    value: "medium",
                },
                {
                    name: "Big",
                    value: "big",
                }
            )
            .setRequired(true)
    )
    .addIntegerOption((o) =>
        o
            .setName("background_brightness")
            .setDescription(
                "Overlay image shadow size  (use negative values to darker background)"
            )
            .setMinValue(0)
            .setMaxValue(100)
            .setRequired(true)
            .setRequired(true)
    );

resizebg.setExecuteFunction(async (command) => {
    const attachment = command.options.getAttachment("base", true);
    const shadowSettings = command.options.getString("shadow_size", true);
    const percentage = Number(command.options.getString("base_size", true));
    const backgroundBrightness =
        command.options.getInteger("background_brightness", true) / 100;
    const sizing = command.options
        .getString("output_size", true)
        .split(",")
        .map((s) => Number(s));

    const shadowPresets: {
        [key: string]: {
            blur: number;
            x: number;
            y: number;
            size: number;
        };
    } = {
        small: {
            blur: 10,
            x: 0,
            y: 0,
            size: 1,
        },
        medium: {
            blur: 10,
            x: -15,
            y: -15,
            size: 1.05,
        },
        big: {
            blur: 15,
            x: -35,
            y: -35,
            size: 1.1,
        },
    };

    if (!attachment.width || !attachment.height) return;

    if (attachment.width > 1920 || attachment.height > 1080)
        return command.editReply({
            embeds: [generateErrorEmbed("Max image size is `1920x1080`")],
        });

    const validImageMimes = ["image/png", "image/jpg", "image/jpeg"];

    if (!validImageMimes.includes(attachment.contentType || ""))
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Invalid image type! Image type must be `jpg`, `jpeg` or `png`"
                ),
            ],
        });

    const canvas = createCanvas(sizing[0], sizing[1]);

    const jimpBase = await Jimp.read(attachment.url);
    const jimpBg = jimpBase.clone();
    const jimpOverlay = jimpBase.clone();

    jimpBase.resize(sizing[0], sizing[1]);

    jimpBg.cover(sizing[0], sizing[1]);
    jimpBg.blur(30);
    jimpBase.composite(
        jimpBg,
        canvas.width / 2 - jimpBg.getWidth() / 2,
        canvas.height / 2 - jimpBg.getHeight() / 2
    );

    const backgroundBrightnessOverlay = await Jimp.read(
        "https://cdn.discordapp.com/attachments/950107895754784908/1077605204175892480/iu.png"
    );

    backgroundBrightnessOverlay.resize(sizing[0], sizing[1]);

    backgroundBrightnessOverlay.opacity(backgroundBrightness);
    jimpBase.composite(backgroundBrightnessOverlay, 0, 0);

    jimpOverlay.scaleToFit(
        canvas.width * percentage,
        canvas.height * percentage
    );

    const shadowMask = await Jimp.read(
        "https://cdn.discordapp.com/attachments/950107895754784908/1077594060627390575/BLANK_ICON.png"
    );
    shadowMask.resize(
        jimpOverlay.getWidth() * 1.2,
        jimpOverlay.getHeight() * 1.2
    );
    shadowMask.composite(
        jimpOverlay,
        shadowMask.getWidth() / 2 - jimpOverlay.getWidth() / 2,
        shadowMask.getHeight() / 2 - jimpOverlay.getHeight() / 2
    );
    shadowMask.shadow(shadowPresets[shadowSettings]);

    jimpBase.composite(
        shadowMask,
        canvas.width / 2 - shadowMask.getWidth() / 2,
        canvas.height / 2 - shadowMask.getHeight() / 2
    );

    const image = new AttachmentBuilder(
        await jimpBase.getBufferAsync(Jimp.MIME_PNG)
    );

    command.editReply({
        files: [image],
    });
});
