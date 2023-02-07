import { Client, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { tracks } from "../../database";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import addTrack from "./subcommands/tracker/addTrack";
import removeTrack from "./subcommands/tracker/removeTrack";
import colors from "../../constants/colors";

export default {
	name: "bntrack",
	help: {
		description: "Track nominators' request status from the BN website",
		example: "/bntrack",
	},
	interaction: true,
	category: "BNsite",
	subcommands: [addTrack, removeTrack],
	permissions: ["MANAGE_CHANNELS"],
	config: {
		type: 1,
		options: [
			{
				type: 1,
				name: "status",
				description: "Get current tracking info",
			},
			{
				type: 2,
				name: "add",
				description: "Add a tracker configuration",
				options: [
					{
						type: 1,
						name: "tracker",
						description: "Add a tracker to a channel",
						options: [
							{
								name: "channel",
								description: "Target channel",
								type: 7,
								required: true,
							},
							{
								name: "status",
								description:
									"Send the message when the user is...",
								type: 3,
								required: true,
								choices: [
									{
										name: "open",
										value: "open",
									},
									{
										name: "close",
										value: "closed",
									},
									{
										name: "both",
										value: "open,closed",
									},
								],
							},
							{
								name: "modes",
								description:
									"Filter users by modes (Separated by comma)",
								type: 3,
								required: true,
							},
						],
					},
				],
			},
			{
				type: 2,
				name: "remove",
				description: "Add a tracker configuration",
				options: [
					{
						type: 1,
						name: "tracker",
						description: "Remove a tracker from a channel",
						options: [
							{
								name: "channel",
								description: "Target channel",
								type: 7,
								required: true,
							},
						],
					},
				],
			},
		],
	},
	run: async (
		bot: Client,
		command: ChatInputCommandInteraction,
		args: string[]
	) => {
		await command.deferReply();

		if (!command.member) return;

		const guildTrackers = await tracks.find({
			guild: command.guildId,
			type: "qat",
		});

		if (guildTrackers.length == 0)
			return command.editReply({
				embeds: [
					generateErrorEmbed(
						"This server doesn't have any tracker configured. Use `/bntrack add tracker` to add a tracker."
					),
				],
			});

		function getStatus(track: any) {
			const status: string[] = [];
			const texts = ["open", "closed"];

			for (let i = 0; i < 2; i++) {
				if (track.targets[texts[i]] == true) status.push(texts[i]);
			}

			return status.join(",");
		}

		const embed = new EmbedBuilder()
			.setTitle("Current BN trackers")
			.setDescription(
				`${guildTrackers
					.map((t) => {
						return `<#${t.channel}> [${t.targets.modes.join(
							","
						)}] (${getStatus(t)})`;
					})
					.join("\n")}`
			)
			.setColor(colors.qat)
			.setFooter({
				text: "BN website",
				iconURL: "https://bn.mappersguild.com/images/qatlogo.png",
			});

		command.editReply({
			embeds: [embed],
		});
	},
};
