import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandRoleOption,
    SlashCommandStringOption,
} from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const verificationAddGroupRole = new SlashCommandSubcommand()
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

verificationAddGroupRole.setExecutable(async (command) => {
    if (!command.guild) return;

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

    const botAsMember = await command.guild.members.fetch(command.client.user.id);

    if (role.position >= botAsMember.roles.highest.position)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "You need to provide a role that is below that my highest role."
                ),
            ],
        });

    if (!["LVD", "GMT", "ALM"].includes(group) && mode == "none")
        return command.editReply({
            embeds: [generateErrorEmbed("This role can't use this mode.")],
        });

    const newRole = {
        id: role.id,
        modes: mode == "all" ? [] : [mode],
        group,
    };

    // * Add optional modes
    for (let i = 1; i < 5; i++) {
        const extra_value = command.options.getString(`mode_${i + 1}`);

        if (extra_value) {
            newRole.modes.push(extra_value);
        }
    }

    if (
        guild.verification.targets.group_roles.find(
            (r: any) =>
                r.id == newRole.id &&
                r.group == newRole.group &&
                r.modes.join(",") == newRole.modes.join(",")
        )
    )
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "There's a role with the same configuration. You can't add a role with the same parameters."
                ),
            ],
        });

    guild.verification.targets.group_roles.push(newRole);

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed("group role added!")],
    });
});

export { verificationAddGroupRole };
