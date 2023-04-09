import {
    ChannelType,
    Client,
    GuildChannelResolvable,
    PermissionFlagsBits,
} from "discord.js";

import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../modules/osu/url/checkOsuURL";
import { antiDumbass } from "../modules/verification/message/antiDumbass";

export default {
    name: "messageCreate",
    execute(bot: Client) {
        bot.on("messageCreate", async (message) => {
            if (message.author.bot || !bot.user) return;

            if (
                ![ChannelType.GuildText, ChannelType.DM].includes(
                    message.channel.type
                )
            )
                return;

            if (
                message.guild &&
                !message.guild.members.cache
                    .get(bot.user.id)
                    ?.permissionsIn(message.channel as GuildChannelResolvable)
                    .has(PermissionFlagsBits.SendMessages)
            )
                return;

            sendQuotes(message, bot);
            checkOsuURL(message);
            antiDumbass(message);
        });
    },
};
