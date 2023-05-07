import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const reportSetPing = new SlashCommandSubcommand(
    "ping",
    "Enables report pings and sets the role to ping",
    {
        syntax: "/report `set` `ping` `target_role:<Role>`",
        example: "/report `set` `ping` `target_role:@Moderator`",
    },
    [PermissionFlagsBits.ManageGuild]
);

reportSetPing.builder.addRoleOption((o) =>
    o.setName("target_role").setDescription("Target role").setRequired(true)
);

reportSetPing.setExecuteFunction(async (command) => {
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

    // prevent @everyone
    if (role.id == command.guildId)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to provide a role that isn't @everyone."
                ),
            ],
        });

    // check if role is mentionable or if the bot has the permission to mention it
    const botAsMember = await command.guild.members.fetch(
        command.client.user.id
    );

    if (
        !role.mentionable &&
        !botAsMember.permissions.has(PermissionFlagsBits.MentionEveryone)
    )
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to provide a role that is mentionable or that I have the permission to mention."
                ),
            ],
        });

    guild.reports.ping = true;
    guild.reports.role = role.id;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed(`Report pings enabled and role is set to <@&${role.id}>!`)],
    });
});

export default reportSetPing;
