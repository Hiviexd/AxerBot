import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import * as database from "../../../../database";
import colors from "../../../../constants/colors";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const setRolesAddPreset = new SlashCommandSubcommand(
    "list",
    "lists all role presets",
    undefined,
    [PermissionFlagsBits.ModerateMembers]
);

setRolesAddPreset.setExecuteFunction(async (command) => {
    if (!command.guild || !command.member) return;

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    const embed = new EmbedBuilder()
        .setTitle("📙 Role Presets")
        .setColor(colors.yellow)
        .setDescription(
            guild.role_presets.length == 0 ? "No roles configured" : null
        );

    guild.role_presets.forEach((preset) => {
        return embed.addFields({
            name: `- ${preset.name}`,
            value: `add: ${
                preset.roles_add.map((r) => `<@&${r}>`).join(", ") || "*None*"
            }\nremove: ${
                preset.roles_remove.map((r) => `<@&${r}>`).join(", ") ||
                "*None*"
            }`,
        });
    });

    return command.editReply({ embeds: [embed] });
});

export default setRolesAddPreset;
