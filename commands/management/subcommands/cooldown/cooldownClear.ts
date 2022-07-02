import { Message, ReactionCollector } from "discord.js";
import CommandOptionInvalid from "../../../../responses/embeds/CommandOptionInvalid";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import * as database from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateConfirmationEmbed from "./../../../../helpers/text/embeds/generateConfirmationEmbed";
import generateErrorEmbed from "./../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "cooldown clear",
	trigger: ["clear"],
	help: {
		description:
			"Clear cooldown configuration for the system or a category.",
		syntax: "{prefix}cooldown `clear` `category (optional)`",
	},
	run: async (message: Message, args: string[]) => {
		const categories = ["contests", "fun", "misc", "management", "osu"];
		let guild = await database.guilds.findOne({ _id: message.guildId });

		if (!guild) return;

		async function updateDB() {
			if (!guild) return;

			await database.guilds.findOneAndUpdate({ _id: guild._id }, guild);
		}

		if (
			!message.member?.permissions.has("ADMINISTRATOR") &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		if (args.length < 2) {
			const configured: any[] = [];

			// ? Process provided categories
			Object.keys(guild.cooldown).forEach((option) => {
				if (!guild) return;

				if (
					categories.includes(option) &&
					guild.cooldown[option].size != 0
				) {
					configured.push(guild.cooldown[option]);
				}

				return void {};
			});

			if (configured.filter((c: any) => c.size != 0).length == 0)
				return message.channel.send({
					embeds: [
						generateErrorEmbed(`❗ No cooldowns are configured.`),
					],
				});

			// ? Reset to default
			guild.cooldown = {
				contests: {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				},
				fun: {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				},
				misc: {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				},
				management: {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				},
				osu: {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				},
			};

			generateConfirmationEmbed(
				message,
				updateDB,
				"This will clear the current configuration for __**ALL CHANNELS**__ which **cannot** be undone."
			);
		} else {
			const requested = args[1].toLowerCase();

			if (categories.includes(requested)) {
				if (guild.cooldown[requested].size == 0)
					return message.channel.send({
						embeds: [
							generateErrorEmbed(
								`❗ No cooldowns are configured for the category **${requested}**.`
							),
						],
					});

				guild.cooldown[requested] = {
					size: 0,
					ends_at: {},
					current_increments: 0,
					increments: 0,
					channels: [],
				};

				generateConfirmationEmbed(
					message,
					updateDB,
					`This will remove the category \`${requested}\` from the cooldown list.`
				);
			} else {
				return message.channel.send({ embeds: [CommandOptionInvalid] });
			}
		}
	},
};
