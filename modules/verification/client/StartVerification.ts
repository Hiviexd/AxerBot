import {
	GuildMember,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	ReactionCollector,
} from "discord.js";
import { guilds } from "../../../database";
import parseMessagePlaceholderFromMember from "../../../helpers/text/parseMessagePlaceholderFromMember";
import GenerateAuthToken from "./GenerateAuthToken";

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
			color: "#ea6112",
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

	verification_channel.send({
		content: parseMessagePlaceholderFromMember(
			guild_db.verification.message,
			member,
			guild_db
		),
		components: [buttons],
	});
	// .then((m: Message) => {

	// 	collector.on("collect", () => {
	// 		if (!user_dm)
	// 			return verification_channel.send(
	// 				`<@${member.id}> **Your private messages are disabled! Please, enable private messages from this server and click on the button again.**)`
	// 			);

	// 		if (verification.status != 200 || !verification.data) {
	// 			const error = new MessageEmbed({
	// 				title: "Wait...",
	// 				description: verification.message,
	// 				color: "#ea6112",
	// 			});

	// 			user_dm.send({
	// 				embeds: [error],
	// 			});

	// 			return;
	// 		}

	// 		member
	// 			.send({
	// 				embeds: [embed],
	// 				components: [buttons],
	// 			})

	// 			.then(() => {
	// 				verification_channel.send(
	// 					`<@${member.id}> **Check your private messages.** (If you haven't recieved anything, please allow private messages from this server and click on the button again.)`
	// 				);
	// 			})
	// 			.catch((e) => {
	// 				verification_channel.send(
	// 					`<@${member.id}> **Your private messages are disabled! Please, enable private messages from this server and click on the button again.**)`
	// 				);
	// 			});
	// 	});
	// });
};
