import { SlashCommand } from "../../models/commands/SlashCommand";
import verificationStatus from "./subcommands/verification/status";

const verification = new SlashCommand(
    "verification",
    "Verify new server members automatically using their osu! data!",
    "management",
    false,
    {
        modules: `\`channel\`: Set the system channel
        \`flags\`: Set flags to the system (Example: sync nickname)
		\`roles\`: Set the roles that will be given to all verified users
		\`grouproles\`: Set the roles that will be given to all verified users with X osu! usergroup (i.e BNs)
        \`message\`: Set the welcome message to send on the channel
		\`channel\`: Set the welcome message to send on the channel
        \`enable\`: Enable the system manually.
        \`disable\`: Yep`,
    },
    []
);

verification.addSubcommand(verificationStatus);

export default verification;

// export default {
// 	name: "verification",
// 	help: {
// 		description:
// 			"Verify new server members automatically using their osu! data!",
// 		modules: `\`channel\`: Set the system channel
//         \`flags\`: Set flags to the system (Example: sync nickname)
// 		\`roles\`: Set the roles that will be given to all verified users
// 		\`grouproles\`: Set the roles that will be given to all verified users with X osu! usergroup (i.e BNs)
//         \`message\`: Set the welcome message to send on the channel
// 		\`channel\`: Set the welcome message to send on the channel
//         \`enable\`: Enable the system manually.
//         \`disable\`: Yep`,
// 	},
// 	subcommands: [
// 		setChannel,
// 		setFlags,
// 		setMessage,
// 		// setGroupRoles,
// 		addRole,
// 		removeRole,
// 		removeGroupRole,
// 		addGroupRole,
// 		enable,
// 		disable,
// 		setButton,
// 		addRankRole,
// 		removeRankRole,
// 	],
// 	interaction: true,
// 	config: {
// 		type: 1,
// 		options: [
// 			{
// 				name: "status",
// 				type: 1,
// 				description: "Check current system status",
// 			},
// 			{
// 				name: "add",
// 				description: "Add some value from module.",
// 				type: 2,
// 				max_value: 1,
// 				options: [
// 					{
// 						name: "rankrole",
// 						type: 1,
// 						description: addRankRole.help.description,
// 						options: [
// 							{
// 								name: "role",
// 								type: 8,
// 								description: "Role to add",
// 								max_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "min_rank",
// 								type: 4,
// 								description: "Minimum rank range",
// 								min_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "max_rank",
// 								type: 4,
// 								description: "Max rank range",
// 								min_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "gamemode",
// 								type: 3,
// 								description: "Gamemode to get the rank",
// 								required: true,
// 								choices: [
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "rank_type",
// 								type: 3,
// 								description: "Rank type",
// 								required: true,
// 								choices: [
// 									{
// 										name: "global",
// 										value: "global",
// 									},
// 									{
// 										name: "country",
// 										value: "country",
// 									},
// 								],
// 							},
// 						],
// 					},
// 					{
// 						name: "grouprole",
// 						type: 1,
// 						description: "Add a role for x user with x usergroup.",
// 						options: [
// 							{
// 								name: "group",
// 								type: 3,
// 								description: "Target usergroup",
// 								max_value: 1,
// 								required: true,
// 								choices: [
// 									// "`DEV`: osu!dev",
// 									// "`SPT`: Support Team",
// 									// "`NAT`: Nomination Assessment Team",
// 									// "`BN`: Beatmap Nominators",
// 									// "`PBN`: (Probation BNs)",
// 									// "`GMT`: Global Moderation Team",
// 									// "`LVD`: Project Loved",
// 									// "`ALM`: Alumni",
// 									{
// 										name: "osu!developer",
// 										value: "DEV",
// 									},
// 									{
// 										name: "osu!support",
// 										value: "SPT",
// 									},
// 									{
// 										name: "Nomination Assessment Team",
// 										value: "NAT",
// 									},
// 									{
// 										name: "Beatmap Nominator",
// 										value: "BN",
// 									},
// 									{
// 										name: "Beatmap Nominator (Probationary)",
// 										value: "PBN",
// 									},
// 									{
// 										name: "Global Moderator",
// 										value: "GMT",
// 									},
// 									{
// 										name: "Project Loved",
// 										value: "LVD",
// 									},
// 									{
// 										name: "Alumni",
// 										value: "ALM",
// 									},
// 									{
// 										name: "Beatmap Spotlight Curators",
// 										value: "BSC",
// 									},
// 								],
// 							},
// 							{
// 								name: "role",
// 								type: 8,
// 								description: "Role to add.",
// 								max_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "mode_1",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								required: true,
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_2",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_3",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_4",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_5",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 						],
// 					},
// 					{
// 						name: "role",
// 						type: 1,
// 						description: "remove role to verified users.",
// 						options: [
// 							{
// 								name: "target_role",
// 								type: 8,
// 								description:
// 									"Verified users will receive this role.",
// 							},
// 						],
// 					},
// 				],
// 			},
// 			{
// 				name: "remove",
// 				description: "Remove some value from some module.",
// 				type: 2,
// 				max_value: 1,
// 				options: [
// 					{
// 						name: "rankrole",
// 						type: 1,
// 						description: removeRankRole.help.description,
// 						options: [
// 							{
// 								name: "role",
// 								type: 8,
// 								description: "Role to remove",
// 								max_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "min_rank",
// 								type: 4,
// 								description: "Minimum rank range",
// 								min_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "max_rank",
// 								type: 4,
// 								description: "Max rank range",
// 								min_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "gamemode",
// 								type: 3,
// 								description: "Gamemode to get the rank",
// 								required: true,
// 								choices: [
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "rank_type",
// 								type: 3,
// 								description: "Rank type",
// 								required: true,
// 								choices: [
// 									{
// 										name: "global",
// 										value: "global",
// 									},
// 									{
// 										name: "country",
// 										value: "country",
// 									},
// 								],
// 							},
// 						],
// 					},
// 					{
// 						name: "grouprole",
// 						type: 1,
// 						description: "Add a role for x user with x tag.",
// 						options: [
// 							{
// 								name: "group",
// 								type: 3,
// 								description: "Target usergroup",
// 								max_value: 1,
// 								required: true,
// 								choices: [
// 									// "`DEV`: osu!dev",
// 									// "`SPT`: Support Team",
// 									// "`NAT`: Nomination Assessment Team",
// 									// "`BN`: Beatmap Nominators",
// 									// "`PBN`: (Probation BNs)",
// 									// "`GMT`: Global Moderation Team",
// 									// "`LVD`: Project Loved",
// 									// "`ALM`: Alumni",
// 									{
// 										name: "osu!developer",
// 										value: "DEV",
// 									},
// 									{
// 										name: "osu!support",
// 										value: "SPT",
// 									},
// 									{
// 										name: "Nomination Assessment Team",
// 										value: "NAT",
// 									},
// 									{
// 										name: "Beatmap Nominator",
// 										value: "BN",
// 									},
// 									{
// 										name: "Beatmap Nominator (Probationary)",
// 										value: "PBN",
// 									},
// 									{
// 										name: "Global Moderator",
// 										value: "GMT",
// 									},
// 									{
// 										name: "Project Loved",
// 										value: "LVD",
// 									},
// 									{
// 										name: "Alumni",
// 										value: "ALM",
// 									},
// 									{
// 										name: "Beatmap Spotlight Curators",
// 										value: "BSC",
// 									},
// 								],
// 							},
// 							{
// 								name: "role",
// 								type: 8,
// 								description: "Role to remove.",
// 								max_value: 1,
// 								required: true,
// 							},
// 							{
// 								name: "mode_1",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								required: true,
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_2",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_3",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_4",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 							{
// 								name: "mode_5",
// 								type: 3,
// 								description:
// 									"This role will be added to users with the given usergroup and mode:",
// 								choices: [
// 									{
// 										name: "All Modes",
// 										value: "all",
// 									},
// 									{
// 										name: "None (Like loved captains)",
// 										value: "none",
// 									},
// 									{
// 										name: "osu!",
// 										value: "osu",
// 									},
// 									{
// 										name: "osu!taiko",
// 										value: "taiko",
// 									},
// 									{
// 										name: "osu!catch",
// 										value: "fruits",
// 									},
// 									{
// 										name: "osu!mania",
// 										value: "mania",
// 									},
// 								],
// 							},
// 						],
// 					},
// 					{
// 						name: "role",
// 						type: 1,
// 						description: "Remove role from verified users.",
// 						options: [
// 							{
// 								name: "target_role",
// 								type: 8,
// 								description:
// 									"Verified users don't will receive this role anymore.",
// 							},
// 						],
// 					},
// 				],
// 			},
// 			{
// 				name: "set",
// 				description: "Set some configuration.",
// 				type: 2,
// 				max_value: 1,
// 				options: [
// 					{
// 						name: "disabled",
// 						type: 1,
// 						description: "Disable the system",
// 					},
// 					{
// 						name: "enabled",
// 						type: 1,
// 						description: "Enable the system",
// 					},
// 					{
// 						name: "button",
// 						description: "Toggle verification button",
// 						type: 1,
// 						maxValues: 1,
// 						options: [
// 							{
// 								name: "status",
// 								type: 3,
// 								description: "Enable or disable",
// 								max_value: 1,
// 								required: true,
// 								choices: [
// 									{
// 										name: "enabled",
// 										value: "true",
// 									},
// 									{
// 										name: "disabled",
// 										value: "false",
// 									},
// 								],
// 							},
// 						],
// 					},
// 					{
// 						name: "message",
// 						type: 1,
// 						description:
// 							"Welcome message to send when a user joins",
// 					},
// 					{
// 						name: "channel",
// 						type: 1,
// 						description: "Set system channel",
// 						options: [
// 							{
// 								name: "text_channel",
// 								type: 7,
// 								description: "Text channel to set",
// 								required: true,
// 							},
// 						],
// 					},
// 					{
// 						name: "flag",
// 						type: 1,
// 						description: "Set a flag to sync or no.",
// 						options: [
// 							{
// 								name: "flag",
// 								type: 3,
// 								description: "Data to sync",
// 								max_value: 1,
// 								required: true,
// 								choices: [
// 									{
// 										name: "username",
// 										value: "username",
// 									},
// 								],
// 							},
// 							{
// 								name: "status",
// 								type: 3,
// 								description: "Enable or disable",
// 								max_value: 1,
// 								required: true,
// 								choices: [
// 									{
// 										name: "enable",
// 										value: "true",
// 									},
// 									{
// 										name: "disable",
// 										value: "false",
// 									},
// 								],
// 							},
// 						],
// 					},
// 				],
// 			},

// 			// {
// 			// 	name: "set",
// 			// 	description: "Set some static settings",
// 			// 	type: 3,
// 			// 	max_value: 1,
// 			// 	options: [
// 			// 		{
// 			// 			name: "channel",
// 			// 			type: 7,
// 			// 			description: "Set system channel",
// 			// 		},
// 			// 		{
// 			// 			name: "enabled",
// 			// 			type: 7,
// 			// 			description: "Enable the system.",
// 			// 		},
// 			// 		{
// 			// 			name: "disabled",
// 			// 			type: 7,
// 			// 			description: "Yep",
// 			// 		},
// 			// 	],
// 			// },
// 		],
// 	},
// 	category: "management",
// 	permissions: ["MANAGE_GUILD"],
// 	run: async (
// 		bot: Client,
// 		command: ChatInputCommandInteraction,
// 		args: string[]
// 	) => {
// 		await command.deferReply();

// 		if (!command.member || typeof command.member.permissions == "string")
// 			return;

// 		let guild = await guilds.findById(command.guildId);
// 		if (!guild) return;

// 		const modes: { [key: string]: string } = {
// 			osu: "osu!standard",
// 			taiko: "osu!taiko",
// 			fruits: "osu!catch",
// 			mania: "osu!mania",
// 		};

// 		if (!guild.verification)
// 			return command.editReply(
// 				`What? Nothing to display here... Use \`${guild.prefix}help verification\` to get help`
// 			);

// 		const embed = new EmbedBuilder({
// 			title: "⚙️ Verification configuration",
// 			color: guild.verification.enable ? colors.green : colors.red,
// 			fields: [
// 				{
// 					name: "Status",
// 					value: guild.verification.enable
// 						? "🟢 Enabled"
// 						: "🔴 Disabled",
// 				},
// 				{
// 					name: "Verification Button",
// 					value: guild.verification.button
// 						? "🟢 Enabled"
// 						: "🔴 Disabled",
// 				},
// 				{
// 					name: "Channel",
// 					value:
// 						guild.verification.channel == ""
// 							? "🔴 None"
// 							: `<#${guild.verification.channel}>`,
// 				},
// 				{
// 					name: "Flags",
// 					value: getFlags(),
// 				},
// 				{
// 					name: "Verification Roles",
// 					value: getGeneralRoles(),
// 				},
// 				{
// 					name: "Group Roles",
// 					value: getGroupRoles(),
// 				},
// 				{
// 					name: "Rank Roles",
// 					value: getRankRoles(),
// 				},
// 				{
// 					name: "Welcome Message",
// 					value: guild.verification.message,
// 					/**
// 					 * use this if you want an actual ping to appear instead of {member} (it will have the command author's ping)
// 					 * parseMessagePlaceholderFromMember(
// 						guild.verification.message,
// 						command.member,
// 						guild.verification.message
// 					),
// 					*/
// 				},
// 			],
// 		});

// 		command.editReply({
// 			embeds: [embed],
// 		});

// 		function getFlags() {
// 			if (!guild) return;

// 			let val = "";

// 			const flags = ["username"];

// 			Object.keys(guild.verification.targets).forEach((flag) => {
// 				if (!guild) return;

// 				if (flags.includes(flag)) {
// 					val = val.concat(
// 						`\`${flag}\`: ${guild.verification.targets[flag]}\n`
// 					);
// 				}
// 			});

// 			if (val == "") return "None";

// 			return val;
// 		}

// 		function getRankRoles() {
// 			if (!guild) return "-";

// 			if (!guild.verification.targets.rank_roles) return "-";

// 			if (guild.verification.targets.rank_roles.length == 0) return "-";

// 			return guild.verification.targets.rank_roles
// 				.map(
// 					(r: any) =>
// 						`<@&${r.id}> [#${r.min_rank} -> #${r.max_rank}] | ${
// 							modes[r.gamemode]
// 						} | ${r.type}`
// 				)
// 				.join("\n");
// 		}

// 		function getGroupRoles() {
// 			let val = "";

// 			function getRoleModeText(role: {
// 				group: string;
// 				id: string;
// 				modes: string[];
// 			}) {
// 				if (role.modes) {
// 					return `${
// 						role.modes.length == 0
// 							? "All modes"
// 							: role.modes
// 									.map((m) => {
// 										if (m == "none") return "Without Modes";

// 										return m;
// 									})
// 									.join(", ")
// 					}`;
// 				} else {
// 					return "All modes";
// 				}
// 			}

// 			if (!guild) return;

// 			guild.verification.targets.group_roles.forEach(
// 				(role: { group: string; id: string; modes: string[] }) => {
// 					val = val.concat(
// 						`\`${role.group}\`: <@&${role.id}> [${getRoleModeText(
// 							role
// 						)}]\n`
// 					);
// 				}
// 			);

// 			if (val == "") return "None";

// 			return val;
// 		}

// 		function getGeneralRoles() {
// 			if (!guild) return;

// 			let val = guild.verification.targets.default_roles
// 				.map((r: string) => {
// 					return `<@&${r}>`;
// 				})
// 				.join(", ");

// 			if (val == "") return "None";

// 			return val;
// 		}
// 	},
// };
