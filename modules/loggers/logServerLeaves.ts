import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";

export default async function logServerLeaves(
    member: GuildMember | PartialGuildMember
) {
    try {
        const guild = await database.guilds.findOne({
            _id: member.guild.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!member.guild.channels.cache.get(guild.logging.channel)) return;

        const memberRoles = member.roles.cache
            .filter((roles) => roles.id !== member.guild.id)
            .map((role) => role.toString());

        const embed = new EmbedBuilder()
            .setColor(colors.orange)
            .setAuthor({
                name: member.nickname
                    ? `${member.nickname} (${member.user.tag})`
                    : member.user.tag,
                iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(`👋 ${member.user} has left the server.`)
            .addFields(
                { name: "User id", value: member.id, inline: true },
                {
                    name: "User tag",
                    value: member.user.tag,
                    inline: true,
                }
            )

            .setTimestamp();
        member.nickname
            ? embed.addFields({
                  name: "Nickname",
                  value: member.nickname,
                  inline: true,
              })
            : null;
        embed
            .addFields({
                name: "Account created",
                value: `<t:${moment(member.user.createdAt).format("X")}:f>`,
                inline: false,
            })
            .addFields({
                name: "Joined server",
                value: member.joinedAt
                    ? `<t:${moment(member.joinedAt).format("X")}:f>`
                    : "*Unknown*",
                inline: false,
            });
        memberRoles.length > 0
            ? embed.addFields({ name: "Roles", value: memberRoles.join(", ") })
            : null;

        const channel: any = member.guild.channels.cache.get(
            guild.logging.channel
        );
        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}
