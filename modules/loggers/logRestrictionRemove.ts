import { EmbedBuilder, Guild, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";
import { GuildUserBans } from "../../database/schemas/guildUserBans";

export default async function logRestrictionRemove(
    guildInfo: Guild,
    author: GuildMember,
    userId: string
) {
    try {
        const guild = await database.guilds.findOne({
            _id: guildInfo.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!guildInfo.channels.cache.get(guild.logging.channel)) return;

        const embed = new EmbedBuilder()
            .setColor(colors.yellowBright)
            .setDescription(`🔐 osu! account ${userId} was unrestricted!`)
            .addFields(
                { name: "User id", value: userId, inline: false },
                {
                    name: "Author",
                    value: `${author}`,
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
