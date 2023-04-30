import axios from "axios";
import { SlashCommand } from "../../models/commands/SlashCommand";
import getColors from "get-image-colors";
import { createCanvas, registerFont } from "canvas";
import { AttachmentBuilder, ColorResolvable, EmbedBuilder } from "discord.js";
import { mustUseDarkText } from "../../helpers/images/mustUseDarkText";
import path from "path";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import colorconver, { rgb } from "color-convert";

const imagecolors = new SlashCommand(
    ["combocolors", "imagecolors"],
    "Extract colors from a given image",
    "Tools",
    true
);

imagecolors.builder
    .addAttachmentOption((o) =>
        o
            .setName("image")
            .setRequired(true)
            .setDescription("Image to get colors")
    )
    .addIntegerOption((o) =>
        o
            .setName("count")
            .setDescription("Size of the color palette (Max is 10)")
            .setMaxValue(10)
            .setMinValue(1)
    );

imagecolors.setExecuteFunction(async (command) => {
    const attachment = command.options.getAttachment("image", true);
    const count = command.options.getInteger("count") || 5;
    const allowedMimes = ["image/jpg", "image/jpeg", "image/jfif", "image/png"];

    if (attachment.size > 1e7)
        return command.editReply({
            embeds: [generateErrorEmbed(`File too big! Max filesize is 10mb`)],
        });

    if (!allowedMimes.includes(attachment.contentType || ""))
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    `Invalid file type! The only valid ones are: ${allowedMimes
                        .map((m) => `\`.${m.split("/")[1]}\``)
                        .join(", ")}`
                ),
            ],
        });

    loadFonts();

    const imageBuffer = await axios(attachment.url, {
        responseType: "arraybuffer",
    });

    const colors = await getColors(imageBuffer.data, {
        count: count,
        type: attachment.contentType || "image/png",
    });

    const height = 50;
    const canvas = createCanvas(450, height * colors.length);
    const ctx = canvas.getContext("2d");

    const colorsImage = await getColorsImage();

    async function getColorsImage() {
        for (let i = 0; i < colors.length; i++) {
            const fixedColor = getFixedRGB(
                colors[i].rgb()[0],
                colors[i].rgb()[0],
                colors[i].rgb()[0]
            );

            ctx.fillStyle = `#${colorconver.rgb.hex(fixedColor)}`;

            ctx.fillRect(0, i == 0 ? 0 : height * i, canvas.width, height);

            ctx.fillStyle = mustUseDarkText(
                fixedColor[0],
                fixedColor[1],
                fixedColor[2]
            )
                ? "#000000"
                : "#FFFFFF";

            ctx.font = "500 20px Quicksand";

            const colorText = `#${colorconver.rgb.hex(
                fixedColor[0],
                fixedColor[1],
                fixedColor[2]
            )}`;

            const textMeasure = ctx.measureText(colorText);
            const textHeight =
                textMeasure.actualBoundingBoxAscent +
                textMeasure.actualBoundingBoxDescent;

            ctx.fillText(
                colorText,
                (canvas.width - textMeasure.width) / 2,
                height * (i + 1) - textHeight
            );
        }

        return canvas.toBuffer();
    }

    function getFixedRGB(r: number, g: number, b: number) {
        const thisColorToHSL = colorconver.rgb.hsl(r, g, b);

        if (thisColorToHSL[2] > 83) thisColorToHSL[2] = 83;
        if (thisColorToHSL[2] < 21) thisColorToHSL[2] = 21;

        return colorconver.hsl.rgb(thisColorToHSL);
    }

    function loadFonts() {
        registerFont(path.resolve("./assets/fonts/quicksandL.ttf"), {
            family: "Quicksand",
            weight: "300",
        });

        registerFont(path.resolve("./assets/fonts/quicksandR.ttf"), {
            family: "Quicksand",
            weight: "400",
        });

        registerFont(path.resolve("./assets/fonts/quicksandM.ttf"), {
            family: "Quicksand",
            weight: "500",
        });

        registerFont(path.resolve("./assets/fonts/quicksandSB.ttf"), {
            family: "Quicksand",
            weight: "600",
        });
    }

    const resultAttachment = new AttachmentBuilder(colorsImage, {
        name: "colors.png",
    });

    const embed = new EmbedBuilder()
        .setTitle("🎨 Image color palette")
        .setColor(colors[0].hex("rgb") as ColorResolvable)
        .setImage("attachment://colors.png")
        .addFields(
            {
                name: "osu! Format",
                value: colors
                    .map(
                        (c, i) =>
                            `Combo${i + 1}: ${getFixedRGB(
                                c.rgb()[0],
                                c.rgb()[1],
                                c.rgb()[2]
                            ).join(",")}`
                    )
                    .join("\n"),
                inline: true,
            },
            {
                name: "HEX Colors",
                value: colors
                    .map(
                        (c) =>
                            `#${colorconver.rgb.hex(
                                c.rgb()[0],
                                c.rgb()[1],
                                c.rgb()[2]
                            )}`
                    )
                    .join("\n"),
                inline: true,
            }
        )
        .setFooter({
            iconURL: command.user.avatarURL() || "",
            text: `${command.user.tag}`,
        })
        .setThumbnail(attachment.url);

    command.editReply({
        embeds: [embed],
        files: [resultAttachment],
    });
});

export default imagecolors;
