import { Canvas, createCanvas, loadImage } from "canvas";
import { SlashCommand } from "../../models/commands/SlashCommand";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import {
    AttachmentBuilder,
    SlashCommandAttachmentOption,
    SlashCommandStringOption,
} from "discord.js";
import { CommandCategory } from "../../struct/commands/CommandCategory";

// TODO: Fix images

const speechbubble = new SlashCommand()
    .setName("speechbubble")
    .setNameAliases(["textbubble"])
    .setDescription("Generate a speech bubble meme with the given image")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true)
    .addOptions(
        new SlashCommandAttachmentOption()
            .setName("image")
            .setDescription("Source image")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("template")
            .setDescription("Bubble image type")
            .setChoices(
                {
                    name: "White speech bubble",
                    value: "default",
                },
                {
                    name: "Crop/Transparent",
                    value: "crop",
                }
            )
    );

speechbubble.setExecutable(async (command) => {
    const attachment = command.options.getAttachment("image", true);
    const type = command.options.getString("template") || "default";

    const allowedMimes = ["image/jpg", "image/jpeg", "image/jfif", "image/png"];

    if (attachment.size > 1e7)
        return command.editReply({
            embeds: [generateErrorEmbed(`File too big! Max file size is 10mb`)],
        });

    if (!allowedMimes.includes(attachment.contentType || ""))
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    `Invalid file type! I can just process these files: ${allowedMimes
                        .map((m) => `\`.${m.split("/")[1]}\``)
                        .join(", ")}`
                ),
            ],
        });

    function getImageSize(width: number, height: number, canvas: Canvas) {
        const r = Math.min(canvas.width / width, canvas.height / height);

        return {
            width: width * r + 5,
            height: height * r,
        };
    }

    const sizing: { [key: string]: { width: number; height: number } } = {
        crop: {
            width: attachment.width || 100,
            height: attachment.height || 100,
        },
        default: {
            width: attachment.width || 100,
            height:
                (attachment.height || 100) +
                160 * Math.min((attachment.width || 100) / 490, (attachment.height || 100) / 160),
        },
    };

    const canvas = createCanvas(sizing[type].width, sizing[type].height);

    const ctx = canvas.getContext("2d");

    const baseImage = await loadImage(attachment.url);

    if (type == "crop") {
        const maskImage = await loadImage(
            "https://media.discordapp.net/attachments/959908232736952420/1095157593468579951/bubble.png"
        );

        const maskSize = getImageSize(maskImage.width, maskImage.height, canvas);
        ctx.drawImage(
            maskImage,
            (canvas.width - maskSize.width) / 2,
            -(maskSize.height / 2),
            maskSize.width,
            maskSize.height
        );
        ctx.globalCompositeOperation = "source-out";
        ctx.drawImage(baseImage, 0, 0);
    } else {
        const goofyImage = await loadImage(
            "https://media.discordapp.net/attachments/959908232736952420/1095408128041943141/goofy_bubble.png"
        );

        const sizing = getImageSize(goofyImage.width, goofyImage.height, canvas);

        ctx.drawImage(goofyImage, 0, 0, canvas.width, sizing.height);
        ctx.drawImage(baseImage, 0, sizing.height);
    }

    const result = new AttachmentBuilder(canvas.toBuffer(), {
        name: "bubble.gif",
    });

    command.editReply({
        files: [result],
    });
});

export { speechbubble };
