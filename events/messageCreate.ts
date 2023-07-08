import { ChannelType, GuildChannelResolvable, PermissionFlagsBits } from "discord.js";

import sendQuotes from "../helpers/general/sendQuotes";
import { AxerBot } from "../models/core/AxerBot";
import checkOsuURL from "../modules/osu/url/checkOsuURL";
import { antiDumbass } from "../modules/verification/message/antiDumbass";

export default {
    name: "messageCreate",
    execute(bot: AxerBot) {
        bot.on("messageCreate", async (message) => {
            if (message.author.bot || !bot.user) return;

            if (
                ![
                    ChannelType.GuildText,
                    ChannelType.DM,
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildForum,
                    ChannelType.PublicThread,
                    ChannelType.PrivateThread,
                    ChannelType.AnnouncementThread,
                ].includes(message.channel.type)
            )
                return;

            if (message.guild) {
                const memberSelf = message.guild.members.cache.get(bot.user.id);

                if (!memberSelf) return;
                if (!message.channel) return;

                const permissions = memberSelf.permissionsIn(
                    message.channel as GuildChannelResolvable
                );

                if (!permissions) return;

                if (permissions && !permissions.has(PermissionFlagsBits.SendMessages)) return;
            }

            sendQuotes(message, bot);
            checkOsuURL(message);
            antiDumbass(message);
        });
    },
};
