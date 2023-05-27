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

export default async (interaction: ButtonInteraction, isStatic?: boolean) => {
    if (!interaction.isButton()) return;

    const targets = interaction.customId.split("|");

    if (targets[0] != "verification") return;

    await interaction.deferReply({ ephemeral: true });

    if (interaction.user.id != targets[1] && !isStatic)
        return interaction.editReply("**You're not allowed to use this!**");

    if (!interaction.guild) return;

    let targetVerification = await verifications.findById(targets[2]);

    if (!targetVerification) return;

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
            url: interaction.guild?.iconURL() || "",
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
        if (verification.member.id == interaction.user.id)
            sendVerifiedEmbed(
                verification.user,
                verification.guild,
                verification.member,
                undefined,
                isStatic ? interaction : undefined
            );
    });

    interaction.followUp({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
    });
};
