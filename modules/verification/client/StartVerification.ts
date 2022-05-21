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

	if (verification.status != 200 || !verification.data)
		return user_dm.send(verification.message);

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

	verification_channel
		.send(
			parseMessagePlaceholderFromMember(
				guild_db.verification.message,
				member,
				guild_db
			)
		)
		.then((m: Message) => {
			m.react(guild_db.verification.emoji);

			const collector = new ReactionCollector(m, {
				time: 30000,
				filter: (r, u) => u.id == member.id,
				maxUsers: 1000,
				idle: 30000,
				max: 5,
			});

			collector.on("collect", () => {
				if (!user_dm)
					return verification_channel.send(
						`<@${member.id}> **Your private messages are disabled! Please, enable private messages from this server and react again.**)`
					);

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

				const buttons = new MessageActionRow();
				buttons.addComponents([
					new MessageButton({
						style: "LINK",
						url: `https://axer-auth.herokuapp.com/authorize?code=${verification.data.token}&user=${member.id}`,
						label: "Verify my account",
					}),
				]);

				const embed = new MessageEmbed({
					title: "osu! OAuth Verification Request",
					description: `The server **${member.guild.name}** wants to know who you are. You need to authorize with your osu! account to get access from your read-only profile data (username, mode, usergroup, etc).`,
					thumbnail: {
						url: member.guild.iconURL() || "",
					},
					color: "#f72a59",
				});

				member
					.send({
						embeds: [embed],
						components: [buttons],
					})

					.then(() => {
						verification_channel.send(
							`<@${member.id}> **Check your private messages.** (If you haven't recived anything, please allow private messages from this server.)`
						);
					})
					.catch((e) => {
						verification_channel.send(
							`<@${member.id}> **Your private messages are disabled! Please, enable private messages from this server and react again.**)`
						);
					});
			});
		});
};
