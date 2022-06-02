import { Client, Message, Role } from "discord.js";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import Processing from "../../responses/embeds/Processing";

export default {
	name: "resetroles",
	help: {
		description:
			"Removes the Participant role from all participants, and gives them the Spectator role instead.",
		syntax: "{prefix}resetroles",
	},
	category: "contests",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member || !message.guild || !message.mentions.members)
			return;
		if (
			!message.member.permissions.has("MANAGE_MESSAGES", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let participant = message.guild.roles.cache.find(
			(r: Role) => r.name === "Participant"
		);
		let spectator = message.guild.roles.cache.find(
			(r: Role) => r.name === "Spectator"
		);

		const members = await message.guild.members.fetch();
		let participantCount = 0;

		message.channel
			.send({ embeds: [Processing] })
			.then(async (msg: Message) => {
				members.forEach(async (member) => {
					if (!participant || !spectator) return;
					if (member.roles.cache.has(participant.id)) {
						member.roles.remove(participant).catch((err) => {
							message.channel.send(
								`:x: Error removing participant role for ${member.user.tag}`
							);
						});
						member.roles.add(spectator).catch((err) => {
							message.channel.send(
								`:x: Error setting spectator role for ${member.user.tag}`
							);
						});
						participantCount++;
					}
				});

				setTimeout(() => {
					msg.delete();
					msg.channel.send({
						embeds: [
							generateSuccessEmbed(
								`:white_check_mark: Successfully reset roles for ${participantCount} members.`
							),
						],
					});
				}, 1000);
			});
	},
};
