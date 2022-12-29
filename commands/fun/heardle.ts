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
import { users, heardles } from "../../database";
import { Beatmapset } from "../../types/beatmap";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import moment from "moment";
import relativeTime from "../../helpers/general/relativeTime";
import crypto from "crypto";
import truncateString from "../../helpers/text/truncateString";
import { consoleLog, consoleCheck } from "../../helpers/core/logger";

export default {
	name: "heardle",
	help: {
		description: "Guess the song!",
		syntax: "/heardle",
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

		const _heardle = await heardles.findOne({ owner: command.user.id });

		if (!command.channel) return;

		function getID() {
			return crypto.randomBytes(30).toString("hex");
		}

		if (action == "start") {
			if (_heardle)
				return command.editReply(
					`You already have another heardle session running on <#${_heardle.channel}>! Please, stop the session and try again.`
				);

			startHeardle();
		}

		if (action == "stop") {
			if (!_heardle)
				return await command.editReply(
					":x: Wait... You don't have a heardle session running! Use `/heardle action:start` to start a session."
				);

			await heardles.deleteMany({ owner: command.user.id });

			await command.editReply(
				":white_check_mark: Done! Use `/heardle action:start` to start another session."
			);
		}

		async function startHeardle() {
			let difficulty = command.options.getInteger("difficulty") || 1;

			consoleLog(
				`heardle`,
				`Starting a new heardle for ${command.user.tag} (${command.user.id}) on ${command.guild?.name} (${command.guildId}) with level ${difficulty}`
			);

			const playedBeatmaps: number[] = [];
			let validIndexes: number[] = [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
				18, 19, 20, 21, 22, 23, 24,
			];

			let answer = "";
			let beatmaps: Beatmapset[] = [];
			let answerIndex = -1;
			let size = 1;
			let actionRow = new MessageActionRow();
			let attachment = new MessageAttachment(".", "Cant_Load.mp3");
			const heardleId = `heardle|${getID()}`;

			const sortedMaps = await updateHeardle();
			const heardle = new heardles({
				_id: heardleId,
				owner: command.user.id,
				difficulty,
				indexes: validIndexes.filter((i) => i != answerIndex),
				created_at: new Date(),
				played: 1,
				message: command.id,
				beatmaps: beatmaps.map((b) => {
					const _map = {};

					Object.assign(_map, {
						id: b.id,
						title: b.title,
						artist: b.artist,
						covers: b.covers,
					});

					return _map;
				}),
				date: new Date(),
				map: sortedMaps[answerIndex],
				channel: command.channel?.id,
				guild: command.guildId,
				answer,
			});
			await heardle.save();

			await command.editReply({
				content: `**Song**: ${heardle.played}/25\n**Level**: ${difficulty}`,
				components: [actionRow],
				files: [attachment],
			});

			consoleCheck(
				`heardle`,
				`Heardle for ${command.user.tag} (${command.user.id}) on ${command.guild?.name} (${command.guildId}) with level ${difficulty} | Started!`
			);

			// bot.on("interactionCreate", async (interaction) => {
			// 	if (interaction.isSelectMenu()) {
			// 		if (interaction.customId != heardleId) return;

			// 		await interaction.deferReply();

			// 		if (!user) return;

			// 		if (!active) {
			// 			interaction.editReply("This sessions is ended.");

			// 			return;
			// 		}

			// 		attempts++;

			// 		const selected = interaction.values[0];
			// 		if (selected == answer) {
			// 			const embed = new MessageEmbed()
			// 				.setAuthor({
			// 					name: interaction.user.username,
			// 					iconURL: interaction.user.avatarURL() || "",
			// 				})
			// 				.setTitle(`✅ Correct answer!`)
			// 				.addField(
			// 					"Beatmap",
			// 					`[${beatmaps[answerIndex].artist} - ${beatmaps[answerIndex].title}](https://osu.ppy.sh/s/${beatmaps[answerIndex].id})`
			// 				)
			// 				.addField("Attempts", `${attempts}`, true)
			// 				.addField(
			// 					"Time",
			// 					`${relativeTime(new Date(), new Date(time))}`,
			// 					true
			// 				)
			// 				.setFooter("Next map in 5 seconds...")
			// 				.setImage(beatmaps[answerIndex].covers["cover@2x"])
			// 				.setColor("#17ea64");

			// 			await command.editReply({
			// 				content: `Loading next map...`,
			// 				embeds: [],
			// 				files: [],
			// 			});

			// 			const reply = await interaction.editReply({
			// 				content: `<@${interaction.user.id}>`,
			// 				embeds: [embed],
			// 			});

			// 			setTimeout(() => {
			// 				interaction.deleteReply();
			// 				updateHeardle();
			// 				attempts = 0;
			// 			}, 5000);

			// 			return;
			// 		} else {
			// 			await command.editReply({
			// 				content: "Nop, try again.",
			// 			});
			// 			interaction.deleteReply();
			// 		}
			// 	}
			// });

			async function updateHeardle(): Promise<any> {
				const b = await osuApi.fetch.featuredBeatmapsets(difficulty);

				if (b.status != 200 || !b.data) {
					validIndexes = [
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
						16, 17, 18, 19, 20, 21, 22, 23, 24,
					];

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

				actionRow = new MessageActionRow().setComponents(
					beatmapTitleSelection
				);

				attachment = await getAudio(sortedBeatmaps[answerIndex].id);

				return sortedBeatmaps;
			}

			async function getAudio(id: number) {
				try {
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
				} catch (e) {
					command.editReply(
						"osu! website sucks, i can't load the beatmap preview. Please, start a new section."
					);

					return new MessageAttachment(
						".",
						"osu_website_response.mp3"
					);
				}
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
						label: truncateString(
							`${map.title} - ${map.artist}`,
							100
						),
						value: map.title,
					});
				});

				return sortedMaps;
			}
		}
	},
};
