import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
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

    if (!verification_channel || verification_channel.type != "GUILD_TEXT") {
        return member.client.users.cache
            .get(member.guild.ownerId)
            ?.send(
                `The verification system isn't working because you didn't set any channel or the channel is deleted. ${member.user.tag} is waiting for the verification. Please, verify the user manually and fix the system.`
            );
    }

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

    if (guild_db.verification.button) {
        const buttons = new ActionRowBuilder<ButtonBuilder>();

        buttons.addComponents([
            new ButtonBuilder({
                customId: `verification|${member.id}|${verification.data._id}`,
                label: "Start verification",
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
                components: [buttons],
            })
            .then(() => {
                consoleLog(
                    "Verification",
                    `Sent verification to ${member.user.tag} in ${member.guild.name}`
                );
            });
    } else {
        verification_channel.send({
            content: parseMessagePlaceholderFromMember(
                guild_db.verification.message,
                member,
                guild_db
            ),
        });
    }
};
