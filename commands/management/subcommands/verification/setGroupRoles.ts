import { Message } from "discord.js";
import { ownerId } from "../../../../config.json";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "verification grouproles",
	trigger: ["grouproles"],
	help: {
		description: "Set the roles that accounts with X user tag will recive",
		syntax: "{prefix}verification `grouproles` `<Group>,<Role Id|Role Mention>`",
		example:
			"{prefix}verification `grouproles` `BN,@Beatmap Nominators ALM,1234567890`",
		groups: [
			"`DEV`: osu!dev",
			"`SPT`: Support Team",
			"`NAT`: Nomination Assessment Team",
			"`BN`: Beatmap Nominators",
			"`PBN`: (Probation BNs)",
			"`GMT`: Global Moderation Team",
			"`LVD`: Project Loved",
			"`ALM`: Alumni",
		],
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(message.guildId);

		const mentionedRoles: { group: string; id: string }[] = [];
		const usergroups = [
			"DEV",
			"SPT",
			"NAT",
			"BN",
			"PBN",
			"GMT",
			"LVD",
			"ALM",
		];

		args.forEach((a) => {
			const tag = a.split(",");

			if (tag.length != 2) return;

			if (
				!isNaN(Number(removeTextMarkdown(tag[1]))) &&
				usergroups.includes(tag[0].toUpperCase())
			) {
				mentionedRoles.push({
					group: tag[0].toUpperCase(),
					id: removeTextMarkdown(tag[1]),
				});
			}
		});

		function removeTextMarkdown(text: string) {
			const startRegex = /<@&/g;
			const endRegex = />/g;

			text = text.replace(startRegex, "").replace(endRegex, "");

			return text;
		}

		const validMentionedRoles: { group: string; id: string }[] = [];

		if (!message.client.user) return;

		const clientRoles = (
			await message.guild?.members.fetch({
				user: message.client.user.id,
			})
		)?.roles;

		if (!clientRoles?.highest) return;

		for (const r of mentionedRoles) {
			if (message.guild) {
				try {
					const role = await message.guild.roles.fetch(r.id);

					if (
						role &&
						role.position <= clientRoles?.highest.position &&
						!guild.verification.targets.group_roles.includes({
							group: r.group,
							id: r.id,
						})
					) {
						validMentionedRoles.push({
							group: r.group,
							id: role.id,
						});
					}
				} catch (e) {
					console.error(e);
				}
			}
		}

		if (validMentionedRoles.length == 0)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❌ Mention valid roles that are below my top role!"
					),
				],
			});

		guild.verification.targets.group_roles = validMentionedRoles;

		await guilds.findByIdAndUpdate(guild._id, guild);

		message.channel.send({
			embeds: [
				generateSuccessEmbed(
					`✅ Successfully set the roles for the following groups: ${validMentionedRoles.map(
						(r) => `\`${r.group}\``
					).join(", ")}`
				),
			],
		});
	},
};
