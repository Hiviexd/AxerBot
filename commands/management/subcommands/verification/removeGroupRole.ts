import { PermissionFlagsBits, SlashCommandRoleOption, SlashCommandStringOption } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationRemoveGroupRole = new SlashCommandSubcommand()
    .setName("grouprole")
    .setDescription("Add discord roles for users that has roles on osu!")
    .setHelp({
        groups: [
            "`DEV`: osu!dev",
            "`SPT`: Support Team",
            "`NAT`: Nomination Assessment Team",
            "`BN`: Beatmap Nominators",
            "`PBN`: Probationary BNs",
            "`GMT`: Global Moderation Team",
            "`LVD`: Project Loved",
            "`ALM`: Alumni",
        ],
        modes: [
            "`osu`: osu!",
            "`taiko`: osu!taiko",
            "`fruits`: osu!catch",
            "`mania`: osu!mania",
            "`No Modes`: This is for groups without modes, like GMT",
        ],
    })
    .addOptions(
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("Target role")
            .setRequired(true),
        new SlashCommandStringOption()
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
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("mode")
            .setDescription("Game Mode of the role")
            .addChoices(
                {
                    name: "All Modes",
                    value: "all",
                },
                {
                    name: "No Modes",
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
    )
    .setPermissions("ManageGuild");

verificationRemoveGroupRole.setExecutable(async (command) => {
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

    guild.verification.targets.group_roles = guild.verification.targets.group_roles.filter(
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

export { verificationRemoveGroupRole };
