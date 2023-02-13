import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationAddRole = new SlashCommandSubcommand(
    "role",
    "Adds a role to the default verification role(s) of the server",
    false,
    {
        syntax: "/verification `add` `role` `target_role:<Role>`",
        example: "/verification `add` `role` `target_role:@Verified`",
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationAddRole.builder.addRoleOption((o) =>
    o.setName("target_role").setDescription("Target role").setRequired(true)
);

verificationAddRole.setExecuteFunction(async (command) => {
    await command.deferReply();

    if (!command.guild) return;

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

    const botAsMember = await command.guild.members.fetch(
        command.client.user.id
    );

    if (role.position >= botAsMember.roles.highest.position)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to provide a role that is below that my highest role."
                ),
            ],
        });

    if (guild.verification.targets.default_roles.find((r: any) => r == role.id))
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "There's a role with the same configuration. You can't add a role with the same parameters."
                ),
            ],
        });

    guild.verification.targets.default_roles.push(role.id);

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Verification role added!")],
    });
});

export default verificationAddRole;
