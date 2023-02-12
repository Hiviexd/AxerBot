import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Interaction,
} from "discord.js";
import colors from "../../constants/colors";
import { verifications } from "../../database";

export default async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const targets = interaction.customId.split("|");

    if (targets[0] != "verification") return;

    if (interaction.user.id != targets[1])
        return interaction.editReply({
            content: `**You're not allowed to use this!**`,
        });

    if (!interaction.guild) return;

    let targetVerification = await verifications.findById(targets[2]);

    if (!targetVerification)
        return interaction.editReply({
            content: `**You don't have any pending verification here... If this is an error, leave and join the server again!**`,
        });

    const embed = new EmbedBuilder({
        title: "🔍 Verify your account!",
        description: `To verify your account, use \`!verify <code>\` [here](https://osu.ppy.sh/home/messages/users/${process.env.IRC_OSU_ID})`,
        fields: [
            {
                name: "Your code is",
                value: targetVerification.code,
            },
        ],
        thumbnail: {
            url: interaction.guild.iconURL() || "",
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

    interaction.editReply({
        embeds: [embed],
        components: [buttons],
    });
};
