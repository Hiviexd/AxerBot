import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const setRolesAddPreset = new SlashCommandSubcommand(
    "remove",
    "removes a role preset",
    undefined,
    [PermissionFlagsBits.ModerateMembers]
);

setRolesAddPreset.builder.addStringOption((o) =>
    o.setName("name").setDescription("Role preset name").setRequired(true)
);

setRolesAddPreset.setExecuteFunction(async (command) => {
    if (!command.guild || !command.member) return;

    const name = command.options.getString("name", true);

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    let rolePresets = guild.role_presets;

    const preset = guild.role_presets.find((p) => p.name == name);

    if (!preset) {
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Role preset not found!\n\n use `/setroles preset list` to see all role presets"
                ),
            ],
        });
    }

    rolePresets = rolePresets.filter((p) => p.name != name);

    await guilds.findByIdAndUpdate(guild._id, {
        $set: {
            role_presets: rolePresets,
        },
    });

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Role preset removed")
        .setDescription(`Role preset has been removed!`)
        .addFields(
            {
                name: "Name",
                value: preset.name || "*None*",
            },
            {
                name: "Roles to add",
                value:
                    preset.roles_add.map((r) => `<@&${r}>`).join(", ") ||
                    "*None*",
            },
            {
                name: "Roles to remove",
                value:
                    preset.roles_remove.map((r) => `<@&${r}>`).join(", ") ||
                    "*None*",
            }
        );

    return command.editReply({ embeds: [embed] });
});

export default setRolesAddPreset;
