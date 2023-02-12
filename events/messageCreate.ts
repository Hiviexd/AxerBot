import {
    ChannelType,
    Client,
    Collection,
    GuildMember,
    PermissionFlagsBits,
} from "discord.js";

import sendQuotes from "../helpers/general/sendQuotes";
import checkOsuURL from "../helpers/osu/url/checkOsuURL";

export default {
    name: "messageCreate",
    execute(bot: Client) {
        bot.on("messageCreate", async (message) => {
            if (message.author === bot.user) return;
            if (message.channel.type != ChannelType.GuildText) return;
            if (!message.guild) return;

            const messageChannel = message.guild.channels.cache.get(
                message.channelId
            );

            if (!messageChannel) return;

            const botAsMember = message.guild.members.cache.get(
                bot.user?.id || ""
            );

            if (!botAsMember) return;

            if (
                !(messageChannel.members as Collection<string, GuildMember>)
                    .get(botAsMember.id)
                    ?.permissions.has(PermissionFlagsBits.SendMessages)
            )
                return;

            if (!botAsMember.permissions.has(PermissionFlagsBits.SendMessages))
                return;

            if (
                !message.channel
                    .permissionsFor(botAsMember, true)
                    .has(PermissionFlagsBits.SendMessages) ||
                (!getPermissionForRoles() &&
                    !message.channel
                        .permissionsFor(botAsMember, true)
                        .has(PermissionFlagsBits.SendMessages))
            )
                return;

            function getPermissionForRoles() {
                if (!botAsMember) return false;
                let canSendMessages = false;

                botAsMember.roles.cache.forEach((r) => {
                    if (r.permissions.has("SendMessages") == true)
                        canSendMessages = true;
                });

                return canSendMessages;
            }

            sendQuotes(message, bot);
            checkOsuURL(message);
            // checkOsuAttachment(message); disabled cuz my brain sucks
        });
    },
};
