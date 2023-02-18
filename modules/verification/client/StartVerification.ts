import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    ChannelType,
    PermissionFlagsBits,
} from "discord.js";
import { guilds } from "../../../database";
import parseMessagePlaceholderFromMember from "../../../helpers/text/parseMessagePlaceholderFromMember";
import GenerateAuthToken from "./GenerateAuthToken";
import colors from "../../../constants/colors";
import { consoleLog } from "../../../helpers/core/logger";

export default async (member: GuildMember) => {
    const guild_db = await guilds.findById(member.guild.id);

    if (guild_db == null) return;

    if (!guild_db.verification.enable) return;

    const verification = await GenerateAuthToken(member);

    const verification_channel: any = member.client.guilds.cache
        .get(member.guild.id)
        ?.channels.cache.get(guild_db.verification.channel);

    if (
        !verification_channel ||
        verification_channel.type != ChannelType.GuildText ||
        !member.guild.members.cache
            .get(member.client.user.id)
            ?.permissionsIn(verification_channel)
            .has(PermissionFlagsBits.SendMessages)
    ) {
        consoleLog(
            "Verification",
            `Verification channel is not set or deleted in ${member.guild.name}`
        );

        return member.client.users.cache
            .get(member.guild.ownerId)
            ?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("⚠️ Verification system alert")
                        .setColor(colors.yellowBright)
                        .setDescription(
                            `The verification system in your server \`${member.guild.name}\` is not working properly. It's possible that you didn't set any valid channel, the channel is deleted or i don't have permissions to send messages in that channel.
                            \`${member.user.tag}\` is waiting for verification. Please verify the user manually and fix the system.
                            Reach out to a developer in the [support server](https://discord.gg/MAsnz96qGy) if you need help.`
                        ),
                ],
            })
            .catch(console.error);
    }

    if (
        !member.guild.members.cache
            .get(member.client.user.id)
            ?.permissionsIn(verification_channel)
            .has(PermissionFlagsBits.SendMessages)
    )
        return member.client.users.cache
            .get(member.guild.ownerId)
            ?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("⚠️ Verification system alert")
                        .setColor(colors.yellowBright)
                        .setDescription(
                            `The verification system in your server \`${member.guild.name}\` is not working properly. I don't have permissions to send messages in the channel <#${verification_channel.id}>.
                    \`${member.user.tag}\` is waiting for verification. Please verify the user manually and fix the system.
                    Reach out to a developer in the [support server](https://discord.gg/MAsnz96qGy) if you need help.`
                        ),
                ],
            })
            .catch(console.error);

    if (verification.status != 200 || !verification.data) {
        const error = new EmbedBuilder({
            title: "Something went wrong!",
            description: verification.message,
        }).setColor(colors.orange);

        verification_channel.send({
            embeds: [error],
        });

        return;
    }

    const buttons = new ActionRowBuilder<ButtonBuilder>();

    buttons.addComponents([
        new ButtonBuilder({
            customId: `verification|${member.id}|${verification.data._id}`,
            label: "Send verification",
            style: ButtonStyle.Success,
            emoji: "982656610285527114",
        }),
    ]);

    verification_channel
        .send({
            content: parseMessagePlaceholderFromMember(
                guild_db.verification.message,
                member,
                guild_db
            ),
            components: guild_db.verification.button ? [buttons] : [],
        })
        .then(() => {
            consoleLog(
                "Verification",
                `Sent verification to ${member.user.tag} in ${member.guild.name}`
            );
        })
        .catch(console.error);
};
