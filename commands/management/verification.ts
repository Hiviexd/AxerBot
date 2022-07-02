import { Client, Message, MessageEmbed } from "discord.js";
import disable from "./subcommands/verification/disable";
import enable from "./subcommands/verification/enable";
import setChannel from "./subcommands/verification/setChannel";
import setFlags from "./subcommands/verification/setFlags";
import setGroupRoles from "./subcommands/verification/setGroupRoles";
import setMessage from "./subcommands/verification/setMessage";
import setRoles from "./subcommands/verification/setRoles";
import { ownerId } from "../../config.json";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { guilds } from "../../database";
import parseMessagePlaceholderFromMember from "../../helpers/text/parseMessagePlaceholderFromMember";

export default {
	name: "verification",
	help: {
		description:
			"Verify new server members automatically using their osu! data!",
		modules: `\`channel\`: Set the system channel
        \`flags\`: Set flags to the system (Example: sync nickname)
		\`roles\`: Set the roles that will be given to all verified users
		\`grouproles\`: Set the roles that will be given to all verified users with X osu! usergroup (i.e BNs)
        \`message\`: Set the welcome message to send on the channel
        \`enable\`: Enable the system manually.
        \`disable\`: Yep`,
	},
	subcommands: [
		setChannel,
		setFlags,
		setMessage,
		setRoles,
		setGroupRoles,
		enable,
		disable,
	],
	category: "management",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(message.guildId);
		if (!guild) return;

		if (!guild.verification)
			return message.reply(
				`What? Nothing to display here... Use \`${guild.prefix}help verification\` to get help`
			);

		const embed = new MessageEmbed({
			title: "Current system configuration",
			color: guild.verification.enable ? "#1df27d" : "#e5243b",
			fields: [
				{
					name: "Status",
					value: guild.verification.enable ? "Enabled" : "Disabled",
				},
				{
					name: "Channel",
					value:
						guild.verification.channel == ""
							? "None"
							: `<#${guild.verification.channel}>`,
				},
				{
					name: "Flags",
					value: getFlags(),
				},
				{
					name: "Verification Roles",
					value: getGeneralRoles(),
				},
				{
					name: "Group Roles",
					value: getGroupRoles(),
				},
				{
					name: "Welcome Message",
					value: guild.verification.message,
					/**
					 * use this if you want an actual ping to appear instead of {member} (it will have the command author's ping)
					 * parseMessagePlaceholderFromMember(
						guild.verification.message,
						message.member,
						guild.verification.message
					),
					*/
				},
			],
		});

		message.reply({
			embeds: [embed],
		});

		function getFlags() {
			if (!guild) return;

			let val = "";

			const flags = ["username"];

			Object.keys(guild.verification.targets).forEach((flag) => {
				if (!guild) return;

				if (flags.includes(flag)) {
					val = val.concat(
						`\`${flag}\`: ${guild.verification.targets[flag]}\n`
					);
				}
			});

			if (val == "") return "None";

			return val;
		}

		function getGroupRoles() {
			let val = "";

			function getRoleModeText(role: {
				group: string;
				id: string;
				modes: string[];
			}) {
				if (role.modes) {
					return `${
						role.modes.length == 0
							? "All modes"
							: role.modes
									.map((m) => {
										if (m == "none") return "Without Modes";

										return m;
									})
									.join(", ")
					}`;
				} else {
					return "All modes";
				}
			}

			if (!guild) return;

			guild.verification.targets.group_roles.forEach(
				(role: { group: string; id: string; modes: string[] }) => {
					val = val.concat(
						`\`${role.group}\`: <@&${role.id}> [${getRoleModeText(
							role
						)}]\n`
					);
				}
			);

			if (val == "") return "None";

			return val;
		}

		function getGeneralRoles() {
			if (!guild) return;

			let val = guild.verification.targets.default_roles
				.map((r: string) => {
					return `<@&${r}>`;
				})
				.join(", ");

			if (val == "") return "None";

			return val;
		}
	},
};
