import { Message, CommandInteraction } from "discord.js";
import { ownerId } from "../../../../config.json";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "rankrole",
	group: "remove",
	help: {
		description: "Remove a rank role",
		syntax: "/verification `remove rankrole` `role: @role` `min_rank:number` `max_rank:number` `gamemode: <Gamemode>` `rank_type: <Rank Type>`",
		gamemode: ["`osu!`", "`osu!taiko`", "`osu!catch`", "`osu!mania`"],
		"rank types": ["`country`", "`global`"],
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

		const minRank = command.options.getInteger("min_rank", true);
		const maxRank = command.options.getInteger("max_rank", true);
		const role = command.options.getRole("role", true);
		const gamemode = command.options.getString("gamemode", true);
		const rankType = command.options.getString("rank_type", true);

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		if (
			!guild.verification.targets.rank_roles ||
			guild.verification.targets.rank_roles.length == 0
		)
			return command.editReply("You need to add a role before!");

		const index = guild.verification.targets.rank_roles.find(
			(r: any) =>
				r.id == role.id &&
				r.min_rank == minRank &&
				r.max_rank == maxRank &&
				r.gamemode == gamemode &&
				r.type == rankType
		);

		if (index == -1)
			return command.editReply("Role not found! Check the params");

		guild.verification.targets.rank_roles.splice(index, 1);

		await guilds.findByIdAndUpdate(command.guildId, guild);

		command.editReply({
			embeds: [generateSuccessEmbed("✅ Role removed!")],
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
		// 				!guild.verification.targets.rank_roles.includes({
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

		// guild.verification.targets.rank_roles = validMentionedRoles;

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
