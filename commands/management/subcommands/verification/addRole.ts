import { Message, CommandInteraction } from "discord.js";
import { ownerId } from "../../../../config.json";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "role",
	group: "add",
	help: {
		description: "Adds a role to the default verification role(s) of the server",
		syntax: "/verification `add role` `target_role:<Role Id|Role Mention>`",
		example:
			"/verification `add role` `target_role:@Verified`",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		if (!command.member || !command.guild || !command.client.user) return;

		if (typeof command.member?.permissions == "string") return;

		await command.deferReply();

		if (
			!command.member.permissions.has("MANAGE_GUILD", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		const role = command.options.getRole("target_role", true);

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		const botAsMember = await command.guild.members.fetch(
			command.client.user.id
		);

		if (role.position >= botAsMember.roles.highest.position)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"You need to provide a role that is below that my highest role."
					),
				],
			});

		if (
			guild.verification.targets.default_roles.find(
				(r: any) => r == role.id
			)
		)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"There's a role with the same configuration. You can't add a role with the same parameters."
					),
				],
			});

		guild.verification.targets.default_roles.push(role.id);

		await guilds.findByIdAndUpdate(command.guildId, guild);

		command.editReply({
			embeds: [generateSuccessEmbed("✅ Role added!")],
		});

		// if (!message.member) return;

		// if (
		// 	!message.member.permissions.has("MANAGE_GUILD", true) &&
		// 	message.author.id !== ownerId
		// )
		// 	return message.channel.send({ embeds: [MissingPermissions] });

		// let guild = await guilds.findById(message.guildId);
		// if (!guild) return;

		// const mentionedRoles: {
		// 	group: string;
		// 	id: string;
		// 	modes?: string[];
		// }[] = [];
		// const usergroups = [
		// 	"DEV",
		// 	"SPT",
		// 	"NAT",
		// 	"BN",
		// 	"PBN",
		// 	"GMT",
		// 	"LVD",
		// 	"ALM",
		// ];

		// args.forEach((a) => {
		// 	const tags = a.split(",");

		// 	if (tags.length < 2) return;

		// 	if (tags.length == 3) {
		// 		const validModes = ["osu", "taiko", "fruits", "mania", "none"];
		// 		const modes = tags[2].split(".");

		// 		const clearModes: string[] = [];
		// 		modes.forEach((mode) => {
		// 			if (!validModes.includes(mode.trim())) return;
		// 			if (clearModes.includes(mode.trim())) return;

		// 			clearModes.push(mode.trim());
		// 		});

		// 		if (
		// 			!isNaN(Number(removeTextMarkdown(tags[1]))) &&
		// 			usergroups.includes(tags[0].toUpperCase())
		// 		) {
		// 			mentionedRoles.push({
		// 				group: tags[0].toUpperCase(),
		// 				id: removeTextMarkdown(tags[1]),
		// 				modes: clearModes,
		// 			});
		// 		}
		// 	} else {
		// 		if (
		// 			!isNaN(Number(removeTextMarkdown(tags[1]))) &&
		// 			usergroups.includes(tags[0].toUpperCase())
		// 		) {
		// 			mentionedRoles.push({
		// 				group: tags[0].toUpperCase(),
		// 				id: removeTextMarkdown(tags[1]),
		// 			});
		// 		}
		// 	}
		// });

		// function removeTextMarkdown(text: string) {
		// 	const startRegex = /<@&/g;
		// 	const endRegex = />/g;

		// 	text = text.replace(startRegex, "").replace(endRegex, "");

		// 	return text;
		// }

		// const validMentionedRoles: {
		// 	group: string;
		// 	id: string;
		// 	modes: string[];
		// }[] = [];

		// if (!message.client.user) return;

		// const clientRoles = (
		// 	await message.guild?.members.fetch({
		// 		user: message.client.user.id,
		// 	})
		// )?.roles;

		// if (!clientRoles?.highest) return;

		// for (const r of mentionedRoles) {
		// 	if (message.guild) {
		// 		try {
		// 			const role = await message.guild.roles.fetch(r.id);

		// 			if (
		// 				role &&
		// 				role.position <= clientRoles?.highest.position &&
		// 				!guild.verification.targets.group_roles.includes({
		// 					group: r.group,
		// 					id: r.id,
		// 					modes: r.modes,
		// 				})
		// 			) {
		// 				validMentionedRoles.push({
		// 					group: r.group,
		// 					id: role.id,
		// 					modes: r.modes || [],
		// 				});
		// 			}
		// 		} catch (e) {
		// 			console.error(e);
		// 		}
		// 	}
		// }

		// if (validMentionedRoles.length == 0)
		// 	return message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				"❌ Mention valid roles that are below my top role!"
		// 			),
		// 		],
		// 	});

		// guild.verification.targets.group_roles = validMentionedRoles;

		// await guilds.findByIdAndUpdate(guild._id, guild);

		// message.channel.send({
		// 	embeds: [
		// 		generateSuccessEmbed(
		// 			`✅ Successfully set the roles for the following groups: ${validMentionedRoles
		// 				.map(
		// 					(r) =>
		// 						`\`${r.group}\` <@&${r.id}> [${
		// 							r.modes.length == 0
		// 								? "All modes"
		// 								: r.modes
		// 										.map((m) => {
		// 											if (m == "none")
		// 												return "Without Modes";

		// 											return m;
		// 										})
		// 										.join(", ")
		// 						}]`
		// 				)
		// 				.join(", ")}`
		// 		),
		// 	],
		// });
	},
};
