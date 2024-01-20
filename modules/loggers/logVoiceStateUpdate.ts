import { EmbedBuilder, VoiceState } from "discord.js";
import colors from "../../constants/colors";
import * as database from "../../database";

export default async (oldState: VoiceState, newState: VoiceState) => {
    try {
        if (!oldState.guild || !oldState.member) return;
        if (!newState.guild || !newState.member) return;

        const guild = await database.guilds.findOne({
            _id: oldState.guild.id,
        });

        if (!guild) return;
        if (guild.logging.enabled === false) return;
        if (!oldState.guild.channels.cache.get(guild.logging.channel)) return;

        const embed = new EmbedBuilder()
            .setColor(colors.purple)
            .setAuthor({
                name: newState.member.nickname
                    ? `${newState.member.nickname} (${newState.member.user.username})`
                    : newState.member.user.username,
                iconURL: newState.member.user.displayAvatarURL(),
            })
            .setDescription(
                `🔊 ${newState.member.user} ${newState.channel ? "joined" : "left"} ${
                    newState.channel ? newState.channel : oldState.channel
                }`
            )
            .addFields(
                { name: "User id", value: newState.member.id, inline: true },
                {
                    name: "Channel id",
                    value: newState.channel
                        ? newState.channel.id
                        : oldState?.channel?.id
                        ? oldState.channel.id
                        : "N/A",
                    inline: true,
                },
                {
                    name: "Channel name",
                    value: newState.channel
                        ? newState.channel.name
                        : oldState?.channel?.name
                        ? oldState.channel.name
                        : "N/A",
                    inline: true,
                }
            )
            .setTimestamp();

        const channel: any = oldState.guild.channels.cache.get(guild.logging.channel);

        if (!channel) return;

        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.error(err);
    }
};
