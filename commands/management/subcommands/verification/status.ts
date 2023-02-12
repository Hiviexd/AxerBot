import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";
import colors from "../../../../constants/colors";
import { guilds } from "../../../../database";

const verificationStatus = new SlashCommandSubcommand(
    "status",
    "Display all parameters of this module",
    false,
    {},
    [PermissionFlagsBits.ManageGuild]
);

verificationStatus.setExecuteFunction(async (command) => {
    await command.deferReply();

    if (!command.member || typeof command.member.permissions == "string")
        return;

    let guild = await guilds.findById(command.guildId);
    if (!guild) return;

    const modes: { [key: string]: string } = {
        osu: "osu!standard",
        taiko: "osu!taiko",
        fruits: "osu!catch",
        mania: "osu!mania",
    };

    if (!guild.verification)
        return command.editReply(
            `What? Nothing to display here... Use \`${guild.prefix}help verification\` to get help`
        );

    const embed = new EmbedBuilder({
        title: "⚙️ Verification configuration",
        fields: [
            {
                name: "Status",
                value: guild.verification.enable ? "🟢 Enabled" : "🔴 Disabled",
            },
            {
                name: "Verification Button",
                value: guild.verification.button ? "🟢 Enabled" : "🔴 Disabled",
            },
            {
                name: "Channel",
                value:
                    guild.verification.channel == ""
                        ? "🔴 None"
                        : `<#${guild.verification.channel}>`,
            },
            {
                name: "Flags",
                value: getFlags(),
            },
            {
                name: "Verification Roles",
                value: getGeneralRoles(),
            },
            {
                name: "Group Roles",
                value: getGroupRoles(),
            },
            {
                name: "Rank Roles",
                value: getRankRoles(),
            },
            {
                name: "Welcome Message",
                value: guild.verification.message,
                /**
					 * use this if you want an actual ping to appear instead of {member} (it will have the command author's ping)
					 * parseMessagePlaceholderFromMember(
						guild.verification.message,
						command.member,
						guild.verification.message
					),
					*/
            },
        ],
    }).setColor(guild.verification.enable ? colors.green : colors.red);

    command.editReply({
        embeds: [embed],
    });

    function getFlags() {
        if (!guild) return;

        let val = "";

        const flags = ["username"];

        Object.keys(guild.verification.targets).forEach((flag) => {
            if (!guild) return;

            if (flags.includes(flag)) {
                val = val.concat(
                    `\`${flag}\`: ${guild.verification.targets[flag]}\n`
                );
            }
        });

        if (val == "") return "None";

        return val;
    }

    function getRankRoles() {
        if (!guild) return "-";

        if (!guild.verification.targets.rank_roles) return "-";

        if (guild.verification.targets.rank_roles.length == 0) return "-";

        return guild.verification.targets.rank_roles
            .map(
                (r: any) =>
                    `<@&${r.id}> [#${r.min_rank} -> #${r.max_rank}] | ${
                        modes[r.gamemode]
                    } | ${r.type}`
            )
            .join("\n");
    }

    function getGroupRoles() {
        let val = "";

        function getRoleModeText(role: {
            group: string;
            id: string;
            modes: string[];
        }) {
            if (role.modes) {
                return `${
                    role.modes.length == 0
                        ? "All modes"
                        : role.modes
                              .map((m) => {
                                  if (m == "none") return "Without Modes";

                                  return m;
                              })
                              .join(", ")
                }`;
            } else {
                return "All modes";
            }
        }

        if (!guild) return;

        guild.verification.targets.group_roles.forEach(
            (role: { group: string; id: string; modes: string[] }) => {
                val = val.concat(
                    `\`${role.group}\`: <@&${role.id}> [${getRoleModeText(
                        role
                    )}]\n`
                );
            }
        );

        if (val == "") return "None";

        return val;
    }

    function getGeneralRoles() {
        if (!guild) return;

        let val = guild.verification.targets.default_roles
            .map((r: string) => {
                return `<@&${r}>`;
            })
            .join(", ");

        if (val == "") return "None";

        return val;
    }
});

export default verificationStatus;
