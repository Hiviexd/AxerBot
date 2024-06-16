import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import { SlashCommandRoleOption } from "discord.js";

const verificationRemoveRole = new SlashCommandSubcommand()
    .setName("role")
    .setDescription("Remove a role from default verification roles")
    .addOptions(
        new SlashCommandRoleOption()
            .setName("target_role")
            .setDescription("Role to remove")
            .setRequired(true)
    )
    .setPermissions("ModerateMembers");

verificationRemoveRole.setExecutable(async (command) => {
    if (!command.guild || !command.client.user) return;

    const role = command.options.getRole("target_role", true);

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    const botAsMember = await command.guild.members.fetch(command.client.user.id);

    if (role.position >= botAsMember.roles.highest.position)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to provide a role that is below that my highest role."
                ),
            ],
        });

    const target = guild.verification.targets.default_roles.find((r: any) => r == role.id);

    if (!target)
        return command.editReply({
            embeds: [generateErrorEmbed("I can't find a role with these parameters.")],
        });

    guild.verification.targets.default_roles = guild.verification.targets.default_roles.filter(
        (r: any) => r != role.id
    );

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Verification role removed!")],
    });
});

export { verificationRemoveRole };
