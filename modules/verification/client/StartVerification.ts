import {
	GuildMember,
	MessageActionRow,
	MessageButton,
	EmbedBuilder,
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
        const error = new MessageEmbed({
            title: "Something went wrong!",
            description: verification.message,
            color: colors.orange,
        });

        verification_channel.send({
            embeds: [error],
        });

        return;
    }

    if (guild_db.verification.button) {
        const buttons = new MessageActionRow();

        buttons.addComponents([
            new MessageButton({
                type: "BUTTON",
                customId: `verification|${member.id}|${verification.data._id}`,
                label: "Send verification link",
                style: "SUCCESS",
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

        // ! remove when verification is fixed
        // const message =
        //     "Hello! Unfortunately, we're currently experiencing temporary issues with our verification system.\nPlease ping a **server admin/moderator** and post your osu! profile to get verified.\n\nFor server admins, if you want to use your custom welcome message instead of this warning, please use `/verification set button status:disabled` for now. Further updates about this will be posted in the bot's [Discord server](https://discord.gg/MAsnz96qGy).";

        // const embed = new MessageEmbed({
        //     title: "⚠️ Notice",
        //     description: message,
        //     color: colors.yellowBright,
        // });

        // verification_channel.send({
        //     content: `<@${member.id}>`,
        //     embeds: [embed],
        // });
        // !
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
