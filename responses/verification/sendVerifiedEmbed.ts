import { Guild, GuildMember, MessageEmbed } from "discord.js";
import { User } from "../../types/user";
import getEmoji from "../../helpers/text/getEmoji";

export async function sendVerifiedEmbed(
    user: User,
    guild: Guild,
    member: GuildMember,
    guild_db: any
) {
    const usergroups = user.groups
        ?.map((group) => {
            return (
                `- ${group.short_name} ` +
                group.playmodes
                    .map((mode: string) => {
                        return `${getEmoji(mode)} `;
                    })
                    .join("")
                    .trim()
            );
        })
        .join("\n");

    const totalMapsets =
        Number(user.ranked_and_approved_beatmapset_count) +
        Number(user.loved_beatmapset_count) +
        Number(user.pending_beatmapset_count) +
        Number(user.graveyard_beatmapset_count);

    const embed = new MessageEmbed()
        .setTitle(`✅ You are verified, ${user.username}!`)
        .setDescription(`Welcome to **${guild.name}**!`)
        .addField(
            "osu! profile",
            `[${user.username}](https://osu.ppy.sh/users/${user.id})`
        )
        .addField(
            "Ranks",
            `${getEmoji(user.playmode.toString())} 🌎 #${
                user.statistics?.global_rank
                    ? user.statistics?.global_rank.toLocaleString("en-US")
                    : "-"
            } (${
                user.statistics?.pp
                    ? Math.round(user.statistics?.pp).toLocaleString("en-US") +
                      "pp"
                    : "-"
            })
            ${getEmoji(
                user.playmode.toString()
            )} :flag_${user.country_code.toLowerCase()}: #${
                user.statistics?.country_rank
                    ? user.statistics?.country_rank.toLocaleString("en-US")
                    : "-"
            }`
        )
        .addField(
            "Beatmap statistics",
            `🗺️ ${totalMapsets} ✅ ${
                user.ranked_and_approved_beatmapset_count
            } 👥 ${user.guest_beatmapset_count}
            ❤ ${user.loved_beatmapset_count} ❓ ${
                Number(user.pending_beatmapset_count) +
                Number(user.graveyard_beatmapset_count)
            } 💭 ${user.nominated_beatmapset_count}
            `
        )
        .setThumbnail(user.avatar_url)
        .setColor("#07f472");

    usergroups ? embed.addField("User group(s)", usergroups) : null;

    const verificationChannel: any = await guild.client.channels.fetch(
        guild_db.verification.channel
    );

    verificationChannel
        .send({
            content: `<@${member.id}>`,
            embeds: [embed],
        })
        .catch(console.error);
}
