import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";

const reportStatus = new SlashCommandSubcommand(
    "status",
    "Display all parameters of this module",
    {},
    [PermissionFlagsBits.ManageGuild]
);

reportStatus.setExecuteFunction(async (command) => {
    if (!command.member || typeof command.member.permissions == "string")
        return;

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    const embed = new EmbedBuilder({
        title: "⚙️ Reports configuration",
        fields: [
            {
                name: "Status",
                value: guild.reports.enable ? "🟢 Enabled" : "🔴 Disabled",
            },
            {
                name: "Channel",
                value:
                    guild.reports.channel == ""
                        ? "🔴 None"
                        : `<#${guild.reports.channel}>`,
            },
            {
                name: "Pings",
                value: guild.reports.ping ? "🟢 Enabled" : "🔴 Disabled",
            },
            {
                name: "Role",
                value: guild.reports.role == "" ? "🔴 None" : `<@&${guild.reports.role}>`,
            },
        ],
    }).setColor(guild.reports.enable ? colors.green : colors.red);

    command.editReply({
        embeds: [embed.toJSON()],
    });
});

export default reportStatus;
