import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Interaction,
} from "discord.js";
import colors from "../../constants/colors";
import { verifications } from "../../database";
import { bot } from "../..";
import { sendVerifiedEmbed } from "../../responses/verification/sendVerifiedEmbed";
import generateErrorEmbed from "../text/embeds/generateErrorEmbed";

export default async (button: ButtonInteraction) => {
    if (!button.isButton()) return;

    const targets = button.customId.split("|");

    if (targets[0] != "static_verification") return;

    await button.deferReply({ ephemeral: true });

    if (!button.guild) return;

    let targetVerification = await verifications.findOne({
        target_user: button.user.id,
        target_guild: button.guild.id,
        type: "verification",
    });

    if (!targetVerification)
        return button.editReply({
            embeds: [
                generateErrorEmbed("You don't have any pending verifications!"),
            ],
        });

    const embed = new EmbedBuilder({
        title: "🔍 Verify your account",
        description: `To verify with your osu! account, send the command below in the bot's osu! PMs, you can go there by clicking [here](https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID}), or by clicking the button below.\n\n**Do NOT reveal this command to the public, as it can risk your identity being compromised on this server!**`,
        fields: [
            {
                name: "Copy and paste this:",
                value: `\`!verify ${targetVerification.code}\``,
            },
        ],
        thumbnail: {
            url: button.guild?.iconURL() || "",
        },
    }).setColor(colors.yellow);

    const buttons = new ActionRowBuilder<ButtonBuilder>();
    buttons.addComponents([
        new ButtonBuilder({
            style: ButtonStyle.Link,
            url: `https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID}`,
            label: "Verify my account",
        }),
    ]);

    bot.Bancho.onVerification(async (verification) => {
        if (verification.member.id == button.user.id)
            sendVerifiedEmbed(
                verification.user,
                verification.guild,
                verification.member,
                undefined,
                button
            );
    });

    button.editReply({
        embeds: [embed],
        components: [buttons],
    });
};
