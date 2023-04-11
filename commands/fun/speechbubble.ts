import { Canvas, createCanvas, loadImage } from "canvas";
import { SlashCommand } from "../../models/commands/SlashCommand";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { AttachmentBuilder } from "discord.js";

const speechbubble = new SlashCommand(
    ["speechbubble", "textbubble"],
    "Generate a speech bubble meme with the given image",
    "Fun",
    true
);

speechbubble.builder.addAttachmentOption((o) =>
    o.setName("image").setDescription("Source image").setRequired(true)
);

speechbubble.setExecuteFunction(async (command) => {
    const attachment = command.options.getAttachment("image", true);

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

    const canvas = createCanvas(
        attachment.width || 100,
        attachment.height || 100
    );
    const ctx = canvas.getContext("2d");

    const baseImage = await loadImage(attachment.url);
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

    const result = new AttachmentBuilder(canvas.toBuffer(), {
        name: "bubble.gif",
    });

    command.editReply({
        files: [result],
    });
});

function getImageSize(width: number, height: number, canvas: Canvas) {
    var r = Math.min(canvas.width / width, canvas.height / height);

    return {
        width: width * r + 5,
        height: height * r,
    };
}

export default speechbubble;
