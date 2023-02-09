import {
    GuildMember,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from "discord.js";
import { guilds } from "../../../database";
import parseMessagePlaceholderFromMember from "../../../helpers/text/parseMessagePlaceholderFromMember";
import GenerateAuthToken from "./GenerateAuthToken";
import colors from "../../../constants/colors";

export default async (member: GuildMember) => {
    const guild_db = await guilds.findById(member.guild.id);

    if (guild_db == null) return;

    if (!guild_db.verification.enable) return;

    const user_dm = await member.user.createDM();

    if (!user_dm) return;

    const verification = await GenerateAuthToken(member);

    if (verification.status != 200 || !verification.data) {
        const error = new MessageEmbed({
            title: "Wait...",
            description: verification.message,
            color: colors.orange,
        });

        user_dm.send({
            embeds: [error],
        });

        return;
    }

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

    if (guild_db.verification.button) {
        const buttons = new MessageActionRow();

        buttons.addComponents([
            new MessageButton({
                type: "BUTTON",
                customId: `verification|${member.id}|${member.guild.id}`,
                label: "Send verification link",
                style: "SUCCESS",
                emoji: "982656610285527114",
            }),
        ]);

        /*
        * original code before the verification system broke
        verification_channel.send({
			content: parseMessagePlaceholderFromMember(
				guild_db.verification.message,
				member,
				guild_db
			),
			components: [buttons],
		});
        */

        // ! remove when verification is fixed
        const message =
            "Hello! Unfortunately, we're currently experiencing temporary issues with our verification system.\nPlease ping a **server admin/moderator** and post your osu! profile to get verified.";

        const embed = new MessageEmbed({
            title: "⚠️ Notice",
            description: message,
            color: colors.yellowBright,
        });

        verification_channel.send({
            content: `<@${member.id}>`,
            embeds: [embed],
        });
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
