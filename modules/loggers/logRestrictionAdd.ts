import { EmbedBuilder, Guild, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";
import { GuildUserBans } from "../../database/schemas/guildUserBans";

export default async function logRestrictionAdd(guildInfo: Guild, restriction: GuildUserBans) {
    try {
        const guild = await database.guilds.findOne({
            _id: guildInfo.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!guildInfo.channels.cache.get(guild.logging.channel)) return;

        const embed = new EmbedBuilder()
            .setColor(colors.yellowBright)
            .setDescription(`🔐 osu! account ${restriction.userId} is restricted!`)
            .addFields(
                { name: "User id", value: restriction.userId, inline: false },
                {
                    name: "Author",
                    value: `<@${restriction.authorId}>`,
                    inline: false,
                },
                {
                    name: "Restriction reason",
                    value: restriction.reason || "Not provided...",
                    inline: false,
                }
            )
            .setTimestamp();

        const channel: any = guildInfo.channels.cache.get(guild.logging.channel);
        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}
