import { PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationRemoveGroupRole = new SlashCommandSubcommand(
    "grouprole",
    "Remove a group role from the system",
    false,
    {
        syntax: "/verification `remove grouprole` `group:<Group Name>` `role:<Role>` `[mode:<modes>]`",
        "how it works":
            "To remove a role, you need to provide all info about that role, including the role mention and usergroup with mode",
        groups: [
            "`DEV`: osu!dev",
            "`SPT`: Support Team",
            "`NAT`: Nomination Assessment Team",
            "`BN`: Beatmap Nominators",
            "`PBN`: (Probation BNs)",
            "`GMT`: Global Moderation Team",
            "`LVD`: Project Loved",
            "`ALM`: Alumni",
            "`BSC`: Beatmap Spotlight Curators",
        ],
        modes: [
            "`osu`: osu!standard",
            "`taiko`: osu!taiko",
            "`fruits`: osu!catch",
            "`mania`: osu!mania",
            "`none`: This is for groups without modes, like LVD",
        ],
    },
    [PermissionFlagsBits.ManageGuild]
);

verificationRemoveGroupRole.builder
    .addRoleOption((o) =>
        o.setName("role").setDescription("Target role").setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("group")
            .setDescription("Role usergroup")
            .addChoices(
                {
                    name: "osu!developer",
                    value: "DEV",
                },
                {
                    name: "osu!support",
                    value: "SPT",
                },
                {
                    name: "Nomination Assessment Team",
                    value: "NAT",
                },
                {
                    name: "Beatmap Nominator",
                    value: "BN",
                },
                {
                    name: "Beatmap Nominator (Probationary)",
                    value: "PBN",
                },
                {
                    name: "Global Moderator",
                    value: "GMT",
                },
                {
                    name: "Project Loved",
                    value: "LVD",
                },
                {
                    name: "Alumni",
                    value: "ALM",
                },
                {
                    name: "Beatmap Spotlight Curators",
                    value: "BSC",
                }
            )
            .setRequired(true)
    )
    .addStringOption((o) =>
        o
            .setName("mode")
            .setDescription("Game Mode of the role")
            .addChoices(
                {
                    name: "All Modes",
                    value: "all",
                },
                {
                    name: "None (Like loved captains)",
                    value: "none",
                },
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
            .setRequired(true)
    );

verificationRemoveGroupRole.setExecuteFunction(async (command) => {
    await command.deferReply();

    const group = command.options.getString("group", true);
    const role = command.options.getRole("role", true);
    const mode = command.options.getString("mode", true);

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    const targetRole = {
        id: role.id,
        modes: mode == "all" ? [] : [mode],
        group,
    };

    // * Add optional modes
    for (let i = 1; i < 5; i++) {
        const extra_value = command.options.getString(`mode_${i + 1}`);

        if (extra_value) {
            targetRole.modes.push(extra_value);
        }
    }

    const targetRoleObject = guild.verification.targets.group_roles.find(
        (r: any) =>
            r.id == targetRole.id &&
            r.group == targetRole.group &&
            r.modes.join(",") == targetRole.modes.join(",")
    );

    if (!targetRoleObject)
        return command.editReply({
            embeds: [generateErrorEmbed("Role not found.")],
        });

    guild.verification.targets.group_roles =
        guild.verification.targets.group_roles.filter(
            (r: any) =>
                r.id != targetRole.id &&
                r.group != targetRole.group &&
                r.modes.join(",") != targetRole.modes.join(",")
        );

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("Group role removed!")],
    });
});

export default verificationRemoveGroupRole;
