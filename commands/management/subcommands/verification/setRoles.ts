import { Message } from "discord.js";
import { ownerId } from "../../../../config.json";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import { guilds } from "../../../../database";

export default {
	name: "verification message",
	trigger: ["roles"],
	help: {
		description: "Set the verification role",
		syntax: "{prefix}verification `roles` `@verified,977686698274193521`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(message.guildId);

		const mentionedRoles = message.mentions.roles;
		const mentionedRolesById: string[] = [];

		args.forEach((a) => {
			if (!isNaN(Number(a))) {
				mentionedRolesById.push(String(a));
			}
		});

		const validMentionedRoles: string[] = [];

		if (!message.client.user) return;

		const clientRoles = (
			await message.guild?.members.fetch({
				user: message.client.user.id,
			})
		)?.roles;

		if (!clientRoles?.highest) return;

		mentionedRoles.forEach((r) => {
			if (
				r.position >= clientRoles?.highest.position &&
				guild.verification.targets.default_roles.includes(r.id)
			)
				return;

			validMentionedRoles.push(r.id);
		});

		for (const r of mentionedRolesById) {
			if (message.guild) {
				try {
					const role = await message.guild.roles.fetch(r);

					if (
						role &&
						role.position <= clientRoles?.highest.position &&
						!guild.verification.targets.default_roles.includes(
							role.id
						)
					) {
						validMentionedRoles.push(role.id);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}

		if (validMentionedRoles.length == 0)
			return message.reply(
				":x: Mention valid roles that are below my roles!"
			);

		guild.verification.targets.default_roles = validMentionedRoles;

		await guilds.findByIdAndUpdate(guild._id, guild);

		message.channel.send(`✅ Done! Default roles updated.`);
	},
};
