import { ButtonInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { bnRules } from "../../database";
import colors from "../../constants/colors";

export async function handleBnRulesButton(button: ButtonInteraction) {
    const targets = button.customId.split(",");

    if (targets[0] != "bnrules") return;

    const userId = targets[1];

    if (!userId || isNaN(Number(userId))) return;

    await button.deferReply({ ephemeral: true });

    const userRules = await bnRules.findById(userId);

    if (!userRules || !userRules.content)
        return button.editReply("This user doesn't has rules set.");

    const embed = new EmbedBuilder()
        .setTitle(`📃 Request rules`)
        .setColor((userRules.colour as ColorResolvable) || colors.pink)
        .setDescription(userRules.content)
        .setThumbnail(`https://a.ppy.sh/${userId}`);

    button.editReply({
        embeds: [embed],
    });
}
