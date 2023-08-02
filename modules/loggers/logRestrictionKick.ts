import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";
import { GuildUserBans } from "../../database/schemas/guildUserBans";

export default async function logRestrictionKick(
    member: GuildMember | PartialGuildMember,
    restriction: GuildUserBans
) {
    try {
        const guild = await database.guilds.findOne({
            _id: member.guild.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!member.guild.channels.cache.get(guild.logging.channel)) return;

        const embed = new EmbedBuilder()
            .setColor(colors.yellowBright)
            .setAuthor({
                name: member.nickname
                    ? `${member.nickname} (${member.user.username})`
                    : member.user.username,
                iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(
                `🔐 ${member.user} was kicked! It's an alt account by ${restriction.userId}`
            )
            .addFields(
                { name: "User id", value: member.id, inline: false },
                {
                    name: "Username",
                    value: member.user.username,
                    inline: false,
                },
                {
                    name: "Account created",
                    value: `<t:${moment(member.user.createdAt).format("X")}:f>`,
                    inline: false,
                },
                {
                    name: "Restriction reason",
                    value: restriction.reason || "Not provided...",
                    inline: false,
                }
            )
            .setTimestamp();

        const channel: any = member.guild.channels.cache.get(guild.logging.channel);
        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}
