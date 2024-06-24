import { ButtonInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import colors from "../../constants/colors";
import qatApi from "../../helpers/qat/fetcher/qatApi";
import truncateString from "../../helpers/text/truncateString";

export async function handleBnRulesButton(button: ButtonInteraction) {
    const targets = button.customId.split(",");

    if (targets[0] != "bnrules") return;

    const userId = targets[1];

    if (!userId || isNaN(Number(userId))) return;

    await button.deferReply({ ephemeral: true });

    const user = await qatApi.fetch.user(Number(userId));

    if (!user || !user.data || user.status != 200)
        return button.editReply("This user doesn't has rules set.");

    const embed = new EmbedBuilder()
        .setTitle(`📃 BN request rules`)
        .setColor(colors.blue)
        .setDescription(truncateString(user.data.requestInfo, 4080))
        .setThumbnail(`https://a.ppy.sh/${userId}`);

    button.editReply({
        embeds: [embed],
    });
}
