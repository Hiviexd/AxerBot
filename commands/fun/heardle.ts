import {
	Client,
	CommandInteraction,
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageEmbed,
	MessageSelectMenu,
} from "discord.js";
import axios from "axios";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { users } from "../../database";
import { Beatmapset } from "../../types/beatmap";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import moment from "moment";
import relativeTime from "../../helpers/general/relativeTime";
import crypto from "crypto";

export default {
	name: "heardle",
	help: {
		description: "Guess the song!",
		syntax: "{prefix}heardle",
	},
	category: "fun",
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "action",
				description: "Start or stop the current session?",
				type: 3,
				max_value: 1,
				required: true,
				choices: [
					{
						name: "start",
						value: "start",
					},
					{
						name: "stop",
						value: "stop",
					},
				],
			},
			{
				name: "difficulty",
				description: "Song sort difficulty",
				type: 4,
				min_value: 1,
				max_value: 100,
			},
		],
	},
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const action = command.options.get("action", true)
			? command.options.get("action", true)?.value
			: "play_count";

		const user = await users.findById(command.user.id);

		if (!user || !command.channel) return;

		if (user.heardle) {
			if (
				(user.heardle.active &&
					user.heardle.guild != command.guildId) ||
				(user.heardle.active &&
					user.heardle.channel != command.channel.id)
			) {
				if (action == "start")
					return command.editReply(
						`You already have another heardle session running on <#${user.heardle.channel}>! Please, stop the session and try again.`
					);
			}
		}

		if (action == "stop") {
			if (!user.heardle.active) {
				if (action == "stop")
					return command.editReply(
						`You doesn't have a heardle session running! Use \`start\` option to start a session.`
					);
			}

			user.heardle.active = false;

			await users.findByIdAndUpdate(command.user.id, user);

			return await command.editReply(
				":white_check_mark: Done! Use `/heardle action:start` to start another session."
			);
		}

		if (action == "start") {
			if (user.heardle.active) {
				return command.editReply(
					`You already have another heardle session running on <#${user.heardle.channel}>! Please, stop the session and try again.`
				);
			}

			user.heardle.guild = command.guildId;
			user.heardle.channel = command.channel.id;
			user.heardle.active = true;

			await users.findByIdAndUpdate(command.user.id, user);

			startHeardle();
		}

		async function startHeardle() {
			let difficulty = command.options.getInteger("difficulty") || 1;

			const playedBeatmaps: number[] = [];
			let validIndexes: number[] = [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
				18, 19, 20, 21, 23, 24,
			];

			let answer = "";
			let beatmaps: Beatmapset[] = [];
			let answerIndex = -1;
			let size = 1;
			let attempts = 0;
			const heardleId = getID();
			let time = new Date();

			updateHeardle();

			bot.on("interactionCreate", async (interaction) => {
				if (interaction.isSelectMenu()) {
					if (interaction.customId != heardleId) return;
					await interaction.deferReply();

					attempts++;

					const selected = interaction.values[0];
					if (selected == answer) {
						const embed = new MessageEmbed()
							.setAuthor({
								name: interaction.user.username,
								iconURL: interaction.user.avatarURL() || "",
							})
							.setTitle(`✅ Correct answer!`)
							.addField(
								"Beatmap",
								`[${beatmaps[answerIndex].artist} - ${beatmaps[answerIndex].title}](https://osu.ppy.sh/s/${beatmaps[answerIndex].id})`
							)
							.addField("Attempts", `${attempts}`, true)
							.addField(
								"Time",
								`${relativeTime(new Date(), new Date(time))}`,
								true
							)
							.setFooter("Next map in 5 seconds...")
							.setImage(beatmaps[answerIndex].covers["cover@2x"])
							.setColor("#17ea64");

						await command.editReply({
							content: `Loading next map...`,
							embeds: [],
							files: [],
						});

						const reply = await interaction.editReply({
							content: `<@${interaction.user.id}>`,
							embeds: [embed],
						});

						setTimeout(() => {
							interaction.deleteReply();
							updateHeardle();
							attempts = 0;
						}, 5000);

						return;
					} else {
						await command.editReply({
							content: "Nop, try again.",
						});
						interaction.deleteReply();
					}
				}
			});

			async function upgradeDifficulty() {}
			async function updateHeardle(): Promise<any> {
				const b = await osuApi.fetch.featuredBeatmapsets(difficulty);

				if (b.status != 200 || !b.data) {
					updateHeardle();
					return [];
				}

				b.data.beatmapsets.splice(25, 999);

				beatmaps = b.data.beatmapsets;

				const beatmapTitleSelection =
					new MessageSelectMenu().setCustomId(heardleId);

				const sortedBeatmaps = getBeatmapNames(beatmapTitleSelection);

				answerIndex =
					validIndexes[
						Math.floor(Math.random() * validIndexes.length)
					];

				if (!sortedBeatmaps[answerIndex]) answerIndex = validIndexes[0];

				answer = sortedBeatmaps[answerIndex].title;
				playedBeatmaps.push(sortedBeatmaps[answerIndex].id);

				const actionRow = new MessageActionRow().setComponents(
					beatmapTitleSelection
				);

				const attachment = await getAudio(
					sortedBeatmaps[answerIndex].id
				);

				await command.editReply({
					content: `**Song**: ${size}/25\n**Level**: ${difficulty}`,
					components: [actionRow],
					files: [attachment],
				});
				time = new Date();

				validIndexes = validIndexes.filter((i) => i != answerIndex);

				if (size == 25) {
					size = 1;
					difficulty++;
					validIndexes = [
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
						16, 17, 18, 19, 20, 21, 23, 24,
					];
				} else {
					size++;
				}

				return b;
			}

			async function getAudio(id: number) {
				const buffer = await axios(
					`https://b.ppy.sh/preview/${id}.mp3`,
					{
						responseType: "arraybuffer",
						headers: {
							accept: "audio/mp3",
						},
					}
				);

				const attachment = new MessageAttachment(
					Buffer.from(buffer.data),
					"Heardle.mp3"
				);

				return attachment;
			}

			function getBeatmapNames(menu: MessageSelectMenu) {
				const sortedMaps = beatmaps;

				sortedMaps.sort((a, b) => {
					if (a.title.toLowerCase() < b.title.toLowerCase()) {
						return -1;
					}
					if (a.title.toLowerCase() > b.title.toLowerCase()) {
						return 1;
					}

					return 0;
				});

				menu.setOptions();
				sortedMaps.forEach((map) => {
					menu.addOptions({
						label: `${map.title} - ${map.artist} `,
						value: map.title,
					});
				});

				return sortedMaps;
			}
		}

		function getID() {
			return crypto.randomBytes(30).toString("hex");
		}
	},
};
