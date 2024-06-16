import {
    EmbedBuilder,
    Role,
    APIRole,
    SlashCommandStringOption,
    SlashCommandRoleOption,
} from "discord.js";
import { guilds } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../../../constants/colors";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const setRolesAddPreset = new SlashCommandSubcommand()
    .setName("add")
    .setDescription("Crate a new role preset")
    .setPermissions("ModerateMembers")
    .addOptions(
        new SlashCommandStringOption()
            .setName("name")
            .setDescription("Role preset name")
            .setRequired(true),
        new SlashCommandRoleOption()
            .setName("role_add_1")
            .setDescription("Role addition to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_add_2")
            .setDescription("Role addition to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_add_3")
            .setDescription("Role addition to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_add_4")
            .setDescription("Role addition to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_add_5")
            .setDescription("Role addition to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_remove_1")
            .setDescription("Role removal to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_remove_2")
            .setDescription("Role removal to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_remove_3")
            .setDescription("Role removal to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_remove_4")
            .setDescription("Role removal to add to the preset"),
        new SlashCommandRoleOption()
            .setName("role_remove_5")
            .setDescription("Role removal to add to the preset")
    );

setRolesAddPreset.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;

    const name = command.options.getString("name", true);
    const roleAdd1 = command.options.getRole("role_add_1");
    const roleAdd2 = command.options.getRole("role_add_2");
    const roleAdd3 = command.options.getRole("role_add_3");
    const roleAdd4 = command.options.getRole("role_add_4");
    const roleAdd5 = command.options.getRole("role_add_5");
    const roleRemove1 = command.options.getRole("role_remove_1");
    const roleRemove2 = command.options.getRole("role_remove_2");
    const roleRemove3 = command.options.getRole("role_remove_3");
    const roleRemove4 = command.options.getRole("role_remove_4");
    const roleRemove5 = command.options.getRole("role_remove_5");

    const roleAddInputs = [roleAdd1, roleAdd2, roleAdd3, roleAdd4, roleAdd5];
    const roleRemoveInputs = [roleRemove1, roleRemove2, roleRemove3, roleRemove4, roleRemove5];

    function sanitizeRoles(roleInputs: (Role | APIRole | null)[]) {
        const r: string[] = [];

        for (const role of roleInputs) {
            if (role) {
                r.push(role.id);
            }
        }

        return r;
    }

    if (!roleAdd1 && !roleRemove1) {
        return command.editReply({
            embeds: [generateErrorEmbed("You must provide at least one role to add or remove")],
        });
    }

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    const roles = guild.role_presets || [];

    const rolePreset = guild.role_presets.find((p) => p.name == name);

    if (rolePreset) {
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Role preset already exists!\n\n use `/setroles preset list` to see all role presets"
                ),
            ],
        });
    }

    roles.push({
        name: name,
        roles_add: sanitizeRoles(roleAddInputs),
        roles_remove: sanitizeRoles(roleRemoveInputs),
    });

    await guilds.findByIdAndUpdate(guild._id, {
        $set: {
            role_presets: roles,
        },
    });

    const embed = new EmbedBuilder()
        .setTitle("✅ Success")
        .setDescription(`Role preset added successfully!`)
        .setColor(colors.green)
        .addFields(
            {
                name: "Name",
                value: name,
            },
            {
                name: "Roles to add",
                value:
                    sanitizeRoles(roleAddInputs)
                        .map((r) => `<@&${r}>`)
                        .join(", ") || "*None*",
            },
            {
                name: "Roles to remove",
                value:
                    sanitizeRoles(roleRemoveInputs)
                        .map((r) => `<@&${r}>`)
                        .join(", ") || "*None*",
            }
        );

    return command.editReply({
        embeds: [embed],
    });
});

export { setRolesAddPreset };
