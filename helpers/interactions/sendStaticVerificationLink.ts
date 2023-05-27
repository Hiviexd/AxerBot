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
import { VerificationType } from "../../modules/verification/client/GenerateAuthToken";
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
                generateErrorEmbed("You don't have any pending verification!"),
            ],
        });

    const embed = new EmbedBuilder({
        title: "🔍 Verify your account",
        description: `To verify with your osu! account, send the command below [here](https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID})`,
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
