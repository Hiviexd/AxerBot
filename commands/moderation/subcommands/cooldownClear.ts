import { Message, ReactionCollector } from "discord.js";
import CommandOptionInvalid from "../../../data/embeds/CommandOptionInvalid";
import MissingPermissions from "../../../data/embeds/MissingPermissions";
import * as database from "../../../database";

export const config = {
	name: "clear",
	description: "Clear cooldown configuration for the system or a category.",
	syntax: "!cooldown `clear` `category (optional)`",
};

export async function run(message: Message, args: string[]) {
	const categories = ["contests", "fun", "misc", "moderation", "osu"];
	let guild = await database.guilds.findOne({ _id: message.guildId });

	if (!message.member?.permissions.has("ADMINISTRATOR"))
		return message.channel.send({ embeds: [MissingPermissions] });

	if (args.length < 2) {
		const configured: any[] = [];

		// ? Process provided categories
		Object.keys(guild.cooldown).forEach((option) => {
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
					{
						title: "Huh?",
						description:
							"Configure a category before redefining the system.",
						color: "#ff5050",
					},
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
			moderation: {
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

		message.channel
			.send({
				embeds: [
					{
						title: "⚠ Are you sure?",
						description:
							"This will clear the current configuration for **ALL CHANNELS**. React with :white_check_mark: to continue",
						color: "#edcd02",
					},
				],
			})
			.then((m) => {
				m.react("✅");

				const collector = new ReactionCollector(m, {
					time: 10000,
					max: 50,
					maxUsers: 100,
				});

				collector.on("collect", async (r, u) => {
					if (r.emoji.name != "✅" || u.id != message.author.id)
						return false;

					await database.guilds.findOneAndUpdate(
						{ _id: guild._id },
						guild
					);

					collector.stop("done");

					m.delete();

					return message.channel.send(":white_check_mark: Done!");
				});

				collector.on("end", (c, r) => {
					if (r != "done") {
						message.channel
							.send(
								":x: You kept me waiting too long! Try again."
							)
							.then((msg) => {
								setTimeout(() => {
									msg.delete();
								}, 5000);
							});

						return m.delete();
					}
				});
			});
	} else {
		const requested = args[1].toLowerCase();

		if (categories.includes(requested)) {
			if (guild.cooldown[requested].size == 0)
				return message.channel.send({
					embeds: [
						{
							title: "Huh?",
							description:
								"Configure this category before redefining it.",
							color: "#ff5050",
						},
					],
				});

			guild.cooldown[requested] = {
				size: 0,
				ends_at: {},
				current_increments: 0,
				increments: 0,
				channels: [],
			};

			message.channel
				.send({
					embeds: [
						{
							title: "⚠ Are you sure?",
							description: `This will remove the category \`${requested}\` from the cooldown list. React with :white_check_mark: to continue`,
							color: "#edcd02",
						},
					],
				})
				.then((m) => {
					m.react("✅");

					const collector = new ReactionCollector(m, {
						time: 10000,
						max: 50,
						maxUsers: 100,
					});

					collector.on("collect", async (r, u) => {
						if (r.emoji.name != "✅" || u.id != message.author.id)
							return false;

						await database.guilds.findOneAndUpdate(
							{ _id: guild._id },
							guild
						);

						collector.stop("done");

						m.delete();

						return message.channel.send(":white_check_mark: Done!");
					});

					collector.on("end", (c, r) => {
						if (r != "done") {
							message.channel
								.send(
									":x: You kept me waiting too long! Try again."
								)
								.then((msg) => {
									setTimeout(() => {
										msg.delete();
									}, 5000);
								});

							return m.delete();
						}
					});
				});
		} else {
			return message.channel.send({ embeds: [CommandOptionInvalid] });
		}
	}
}
