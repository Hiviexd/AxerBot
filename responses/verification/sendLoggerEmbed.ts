import { Guild, GuildMember, EmbedBuilder } from "discord.js";
import moment from "moment";
import { User } from "../../types/user";
import { consoleError } from "../../helpers/core/logger";

export function parseTime(seconds: number): string {
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    let days = Math.floor(hours / 24);
    hours %= 24;

    let time = "";

    switch (true) {
        case days > 0:
            time = `${days}d`;
            break;
        case hours > 0:
            time = `${hours}h`;
            break;
        case minutes > 0:
            time = `${minutes}m`;
            break;
        case seconds > 0:
            time = `${seconds}s`;
            break;
        default:
            time = "0s";
            break;
    }

    return time;
}

export async function sendLoggingEmbed(
    user: User,
    guild: Guild,
    member: GuildMember,
    guild_db: any
) {
    const usergroups = user.groups
        ?.map((group) => {
            return group.short_name;
        })
        .join(", ");

    if (guild_db.logging.enabled) {
        const logChannel: any = await guild.channels.fetch(
            guild_db.logging.channel
        );

        if (logChannel) {
            const accountHistory = user.account_history
                ?.map((silence) => {
                    return `- <t:${moment(silence.timestamp).unix()}:R> | ${
                        silence.description
                    } | ${parseTime(silence.length)}`;
                })
                .join("\n");

            const logEmbed = new EmbedBuilder()
                .setColor("#07f472")
                .setAuthor({
                    name: member.nickname
                        ? `${member.nickname} (${member.user.tag})`
                        : member.user.tag,
                    iconURL: member.user.displayAvatarURL(),
                })
                .setThumbnail(user.avatar_url)
                .setDescription(`✅ ${member.user} has been verified!`)
                .addFields(
                    { name: "User id", value: member.id, inline: true },
                    { name: "User tag", value: member.user.tag, inline: true },
                    { name: "\u200b", value: "\u200b", inline: true },
                    {
                        name: "osu! id",
                        value: user.id.toString(),
                        inline: true,
                    },
                    {
                        name: "osu! username",
                        value: user.username,
                        inline: true,
                    },
                    {
                        name: "osu! profile",
                        value: `[Link](https://osu.ppy.sh/users/${user.id})`,
                        inline: true,
                    },
                    {
                        name: "osu! join date",
                        value: `<t:${moment(user.join_date).format("X")}:f>`,
                        inline: true,
                    },
                    {
                        name: "Country",
                        value: user.country ? user.country.name : "Unknown",
                        inline: true,
                    },
                    {
                        name: "User group(s)",
                        value: usergroups ? usergroups : "-",
                        inline: true,
                    }
                )
                .setTimestamp();

            accountHistory
                ? logEmbed.addFields({
                      name: "Account history",
                      value: accountHistory,
                  })
                : null;

            logChannel.send({ embeds: [logEmbed] }).catch(console.error);
        } else {
            consoleError("logging channel", "Log channel not found");
        }
    }
}
