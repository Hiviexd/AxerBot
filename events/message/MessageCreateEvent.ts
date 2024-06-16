import { ChannelType, GuildChannelResolvable, Message, PermissionFlagsBits } from "discord.js";
import checkOsuURL from "../../modules/osu/url/checkOsuURL";
import { antiDumbass } from "../../modules/verification/message/antiDumbass";

export class MessageCreateEvent {
    private static _eventName = "messageCreate";

    public static async handle(message: Message) {
        if (message.author.bot || !message.guild || !message.channel) return;

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

        const axerAsMember = message.guild.members.cache.get(message.client.user.id);

        if (!axerAsMember) return;

        const permissions = axerAsMember.permissionsIn(message.channel as GuildChannelResolvable);

        if (!permissions) return;

        if (permissions && !permissions.has(PermissionFlagsBits.SendMessages)) return;

        // sendQuotes(message, bot);
        checkOsuURL(message);
        antiDumbass(message);
    }

    public static get eventName() {
        return this._eventName;
    }
}
