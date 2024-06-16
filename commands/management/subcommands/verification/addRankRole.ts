import {
    PermissionFlagsBits,
    SlashCommandIntegerOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
} from "discord.js";

import { guilds } from "../../../../database";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationAddRankRole = new SlashCommandSubcommand()
    .setName("rankrole")
    .setDescription("Add roles to users in a rank range")
    .setHelp({
        gamemode: ["`osu!`", "`osu!taiko`", "`osu!catch`", "`osu!mania`"],
        "rank types": ["`country`", "`global`"],
    })
    .addOptions(
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("Target role")
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName("min_rank")
            .setDescription("Min rank of the role")
            .setRequired(true),
        new SlashCommandIntegerOption()
            .setName("max_rank")
            .setDescription("Max rank of the role")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("gamemode")
            .setDescription("Game Mode of the role")
            .setRequired(true)
            .addChoices(
                {
                    name: "osu!",
                    value: "osu",
                },
                {
                    name: "osu!taiko",
                    value: "taiko",
                },
                {
                    name: "osu!catch",
                    value: "fruits",
                },
                {
                    name: "osu!mania",
                    value: "mania",
                }
            ),
        new SlashCommandStringOption()
            .setName("rank_type")
            .setDescription("Game Mode of the role")
            .setRequired(true)
            .addChoices(
                {
                    name: "global",
                    value: "global",
                },
                {
                    name: "country",
                    value: "country",
                }
            )
    )
    .setPermissions("ModerateMembers");

verificationAddRankRole.setExecutable(async (command) => {
    if (!command.guild) return;

    const minRank = command.options.getInteger("min_rank", true);
    const maxRank = command.options.getInteger("max_rank", true);
    const role = command.options.getRole("role", true);
    const gamemode = command.options.getString("gamemode", true);
    const rankType = command.options.getString("rank_type", true);

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

    if (!minRank || isNaN(minRank) || !maxRank || isNaN(maxRank))
        return command.editReply({
            embeds: [generateErrorEmbed("Valid rank range is 1 -> 1.000.000")],
        });

    const newRole = {
        id: role.id,
        type: rankType,
        gamemode,
        min_rank: minRank,
        max_rank: maxRank,
    };

    if (!guild.verification.targets.rank_roles) guild.verification.targets.rank_roles = [];

    if (guild.verification.targets.rank_roles.length >= 25)
        return command.editReply({
            embeds: [generateErrorEmbed("You can't add more than 25 roles!")],
        });

    guild.verification.targets.rank_roles.push(newRole);

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Rank role added!")],
    });
});

export { verificationAddRankRole };
