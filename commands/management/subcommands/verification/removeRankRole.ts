import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationRemoveRankRole = new SlashCommandSubcommand(
    "rankrole",
    "Remove a rank role from the system",
    {
        syntax: "/verification `remove rankrole` `role: @role` `min_rank:number` `max_rank:number` `gamemode: <Gamemode>` `rank_type: <Rank Type>`",
        gamemode: ["`osu!`", "`osu!taiko`", "`osu!catch`", "`osu!mania`"],
        "rank types": ["`country`", "`global`"],
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationRemoveRankRole.builder
    .addRoleOption((o) => o.setName("role").setDescription("Target role"))
    .addIntegerOption((o) =>
        o.setName("min_rank").setDescription("Min rank of the role")
    )
    .addIntegerOption((o) =>
        o.setName("max_rank").setDescription("Max rank of the role")
    )
    .addStringOption((o) =>
        o
            .setName("gamemode")
            .setDescription("Game Mode of the role")
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
            )
    )
    .addStringOption((o) =>
        o
            .setName("rank_type")
            .setDescription("Game Mode of the role")
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
    );

verificationRemoveRankRole.setExecuteFunction(async (command) => {
    if (!command.member || !command.guild || !command.client.user) return;

    if (typeof command.member?.permissions == "string") return;

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

    if (
        !guild.verification.targets.rank_roles ||
        guild.verification.targets.rank_roles.length == 0
    )
        return command.editReply({
            embeds: [generateErrorEmbed("No rank roles found.")],
        });

    const index = guild.verification.targets.rank_roles.find(
        (r: any) =>
            r.id == role.id &&
            r.min_rank == minRank &&
            r.max_rank == maxRank &&
            r.gamemode == gamemode &&
            r.type == rankType
    );

    if (index == -1)
        return command.editReply({
            embeds: [generateErrorEmbed("Rank role not found.")],
        });

    guild.verification.targets.rank_roles.splice(index, 1);

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Rank role removed!")],
    });
});

export default verificationRemoveRankRole;
