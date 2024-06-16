import {
    EmbedBuilder,
    GuildMember,
    Role,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";
import * as database from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../../../constants/colors";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

// TODO: Add autocomplete to presets

const setRolesApply = new SlashCommandSubcommand()
    .setName("apply")
    .setDescription("Applies a role preset to an user or more")
    .addOptions(
        new SlashCommandStringOption()
            .setName("preset")
            .setDescription("Role preset to apply")
            .setRequired(true),
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("User to apply the roles on")
            .setRequired(true)
    )
    .setPermissions("ModerateMembers");

setRolesApply.setExecutable(async (command) => {
    if (!command.guild || !command.member) return;

    const preset = command.options.getString("preset", true);
    const user = command.options.getUser("user", true);

    let guild = await database.guilds.findById(command.guildId);
    if (!guild) return;

    const rolePreset = guild.role_presets.find((p) => p.name == preset);
    if (!rolePreset) {
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "Role preset not found!\n\n use /setRoles preset list to see all role presets"
                ),
            ],
        });
    }

    const rolesToAdd = rolePreset.roles_add
        .map((r: string) => command.guild?.roles.cache.get(r) || "")
        .filter((r) => r != "");

    const rolesToRemove = rolePreset.roles_remove
        .map((r: string) => command.guild?.roles.cache.get(r) || "")
        .filter((r) => r != "");

    if (!rolesToAdd.length && !rolesToRemove.length)
        return command.editReply({
            embeds: [generateErrorEmbed("No roles found")],
        });

    const member = await command.guild.members.fetch(user.id);

    if (!member) {
        return command.editReply({
            embeds: [generateErrorEmbed("Member not found!")],
        });
    }

    rolesToRemove.length ? member.roles.remove(rolesToRemove as Role[]) : null;
    setTimeout(() => {
        rolesToAdd.length ? member.roles.add(rolesToAdd as Role[]) : null;
    }, 750);

    const commandMember = command.member as GuildMember;

    const embed = new EmbedBuilder()
        .setTitle("✅ Success")
        .setDescription(`Role preset applied on ${member}!`)
        .setColor(colors.green)
        .setFooter({
            text: `${commandMember.nickname || command.user.username}`,
            iconURL: command.user.displayAvatarURL(),
        })
        .addFields(
            {
                name: "Preset",
                value: rolePreset.name || "*No name*",
                inline: true,
            },
            {
                name: "Applied on",
                value:
                    `${
                        member.nickname
                            ? `${member.nickname} (${member.user.tag})`
                            : member.user.tag
                    }` || "*No member*",
                inline: true,
            },
            {
                name: "Roles added",
                value: rolePreset.roles_add.map((r) => `<@&${r}>`).join(", ") || "*None*",
            },
            {
                name: "Roles removed",
                value: rolePreset.roles_remove.map((r) => `<@&${r}>`).join(", ") || "*None*",
            }
        );

    return command.editReply({
        embeds: [embed],
    });
});

export { setRolesApply };
