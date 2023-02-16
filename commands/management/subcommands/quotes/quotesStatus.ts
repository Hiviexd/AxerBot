import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import colors from "../../../../constants/colors";
import * as database from "../../../../database";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const quotesStatus = new SlashCommandSubcommand(
    "status",
    "Display info about system configuration",
    undefined,
    [PermissionFlagsBits.ManageChannels]
);

quotesStatus.setExecuteFunction(async (command) => {
    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    if (!command.guild) return;

    if (!guild.fun.word) guild.fun.word = "axer";

    const embed = new EmbedBuilder()
        .setTitle("⚙️ Current quotes system configuration")
        .setFields(
            {
                name: "Status",
                value: guild.fun.enable ? "`Enabled`" : "`Disabled`",
            },
            {
                name: "List mode",
                value: `\`${guild.fun.mode
                    .charAt(0)
                    .toUpperCase()
                    .concat(guild.fun.mode.slice(1))}\``, // Captalize the first character
            },
            {
                name: "Trigger word",
                value: `\`${guild.fun.word.toLowerCase()}\``,
            },
            {
                name: "Reply chance",
                value: `\`${
                    guild.fun.chance ? `${guild.fun.chance}%` : "100%"
                }\``,
            },
            {
                name: "Blocked channels",
                value:
                    guild.fun.blacklist.channels.length > 0
                        ? `${guild.fun.blacklist.channels.map((c: any) => {
                              return `<#${c}>`;
                          })}`
                        : "None.",
            }
        )
        .setColor(guild.fun.enable ? colors.green : colors.red);

    command.editReply({
        embeds: [embed],
    });
});

export default quotesStatus;
