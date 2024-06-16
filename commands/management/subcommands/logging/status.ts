import { EmbedBuilder } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { guilds } from "../../../../database";
import colors from "../../../../constants/colors";

const loggingStatus = new SlashCommandSubcommand()
    .setName("status")
    .setDescription("Display system's settings")
    .setPermissions("ManageGuild");

loggingStatus.setExecutable(async (command) => {
    if (!command.member || typeof command.member.permissions == "string") return;

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    const embed = new EmbedBuilder()
        .setTitle("⚙️ Logging Configuration")
        .setColor(guild.logging.enabled ? colors.green : colors.red)
        .addFields(
            {
                name: "Status",
                value: guild.logging.enabled ? "🟢 Enabled" : "🔴 Disabled",
                inline: false,
            },
            {
                name: "Channel",
                value: guild.logging.channel ? `<#${guild.logging.channel}>` : "Not set",
                inline: false,
            }
        );

    command.editReply({ embeds: [embed] });
});

export { loggingStatus };
