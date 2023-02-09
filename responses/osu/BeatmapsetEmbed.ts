import {
	ButtonInteraction,
	InteractionCollector,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
} from "discord.js";

import {
	calculateBeatmap,
	BeatmapCalculationResult,
} from "../../helpers/osu/performance/calculateBeatmap";
import generateColoredModeIcon from "../../helpers/text/generateColoredModeIcon";
import { Beatmapset } from "../../types/beatmap";
import osuApi from "../../helpers/osu/fetcher/osuApi";
import getBeatmapEmbedFields from "../../helpers/text/embeds/getBeatmapEmbedFields";
import colors from "../../constants/colors";
import { validateArrayIndex } from "../../helpers/general/validateArrayIndex";
import timeString from "../../helpers/text/timeString";
import crypto from "crypto";
import moment from "moment";

const mods = [
	{ name: "EZ", emoji: "1071874648112910436" },
	{ name: "NF", emoji: "1071874650801459220" },
	{ name: "HT", emoji: "1071874652214931586" },
	{ name: "HR", emoji: "1071874637799108719" },
	{ name: "DT", emoji: "1071874639543943248" },
	{ name: "HD", emoji: "1071874641804660757" },
	{ name: "FL", emoji: "1071874645898309683" },
];

function getModsSelector(handshakeId: string, selectedMods: string[]) {
	const selector = new MessageSelectMenu()
		.setCustomId(`${handshakeId}|mods|handlerIgnore`)
		.setPlaceholder("Mod selector")
		.setMinValues(0)
		.setMaxValues(5);

	for (const mod of mods) {
		selector.addOptions({
			label: mod.name,
			value: mod.name,
			emoji: mod.emoji,
			default: selectedMods.includes(mod.name),
		});
	}

	return selector;
}

function getModsEmojis(selected: string[]) {
	return selected
		.map((mod) => `<:${mod}:${mods.find((m) => m.name == mod)?.emoji}>`)
		.filter((m) => !m.includes("undefined"))
		.join("");
}

export default {
	send: async (
		beatmapset: Beatmapset,
		beatmap_id: string | null,
		mode: "osu" | "taiko" | "mania" | "fruits" | "",
		message: Message
	) => {
		if (!beatmapset.beatmaps) return;

		beatmapset.beatmaps.sort(
			(a, b) => a.difficulty_rating - b.difficulty_rating
		);

		const handshakeId = crypto.randomUUID();
		let mods = ["NM"];

		let selectedDifficultyIndex = beatmap_id
			? validateArrayIndex(
					beatmapset.beatmaps.findIndex(
						(d) => d.id.toString() == beatmap_id
					)
			  )
			: 0;

		const embed = new MessageEmbed();
		let modsSelector = new MessageActionRow().setComponents(
			getModsSelector(handshakeId, mods)
		);

		let beatmapDifficulty = calculateBeatmap(
			(
				await osuApi.fetch.osuFile(
					beatmapset.beatmaps[selectedDifficultyIndex].id
				)
			).data,
			beatmapset.beatmaps[selectedDifficultyIndex].mode_int,
			mods.join("")
		);

		const status_icons: any = {
			ranked: "https://media.discordapp.net/attachments/959908232736952420/961745250462883930/ranked.png",
			loved: "https://media.discordapp.net/attachments/959908232736952420/961745251096199209/loved.png",
			approved:
				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
			qualified:
				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
			pending:
				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
			wip: "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
			graveyard:
				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
		};

		console.log(mods);

		embed.setTitle(`${beatmapset.artist} - ${beatmapset.title}`);
		embed.setColor(colors.pink);
		embed.setURL(getURL());
		embed.setAuthor({
			name: `${beatmapset.status} beatmapset`,
			iconURL: status_icons[beatmapset.status],
		}),
			embed.setThumbnail(`https://b.ppy.sh/thumb/${beatmapset.id}l.jpg`);
		embed.setDescription(
			`⭐ **SR**: \`${beatmapDifficulty.difficulty.starRating.toFixed(
				2
			)}\` | 🕒 **Duration**: \`${timeString(
				beatmapset.beatmaps[selectedDifficultyIndex].total_length
			)}\` | 🎵 **BPM**: \`${getBPMString(
				beatmapDifficulty
			)}\` | **Mods**: ${
				mods.includes("NM") ? "None" : getModsEmojis(mods)
			}`
		);
		embed.setFields(
			{
				name: `${generateColoredModeIcon(
					beatmapset.beatmaps[selectedDifficultyIndex].mode,
					beatmapDifficulty.difficulty.starRating
				)} ${beatmapset.beatmaps[selectedDifficultyIndex].version}`,
				value: getBeatmapEmbedFields(
					beatmapset.beatmaps[selectedDifficultyIndex],
					beatmapset.beatmaps[selectedDifficultyIndex].mode,
					beatmapDifficulty.beatmap,
					beatmapDifficulty.difficulty
				),
				inline: true,
			},
			{
				name: "PP by Accuracy",
				value: beatmapDifficulty.performance
					.map((p) => `${p.acc}%: \`${p.pp}pp\``)
					.join("\n"),
				inline: true,
			}
		);
		embed.setFooter({
			text: `Mapped by ${await getDifficultyMapperName(
				selectedDifficultyIndex
			)} | Last updated at ${moment(beatmapset.last_updated).fromNow()}`,
			iconURL: `https://a.ppy.sh/${beatmapset.beatmaps[selectedDifficultyIndex].user_id}`,
		});

		async function getDifficultyMapperName(index: number) {
			if (!beatmapset.beatmaps) return "Deleted User";

			const r = await osuApi.fetch.user(
				beatmapset.beatmaps[index].user_id.toString()
			);

			if (r.status != 200 || !r.data) return "Deleted User";

			return r.data.username;
		}

		const embedButtonsRow = new MessageActionRow();
		const staticButtonsRow = new MessageActionRow();

		const staticMapperProfileButton = new MessageButton()
			.setLabel("Mapper profile")
			.setStyle("LINK")
			.setURL(`https://osu.ppy.sh/users/${beatmapset.creator}`);

		const staticOsuDirectButton = new MessageButton()
			.setStyle("LINK")
			.setLabel("osu!direct")
			.setURL(
				`https://axer-url.ppy.tn/dl/${beatmapset.beatmaps[selectedDifficultyIndex].id}`
			);

		const staticQuickDownloadButton = new MessageButton({
			type: "BUTTON",
			style: "SECONDARY",
			customId: `beatmap_download|${beatmapset.id}`,
			label: "Quick download",
			emoji: "1070892493333344297",
		});

		staticButtonsRow.addComponents(
			staticMapperProfileButton,
			staticOsuDirectButton,
			staticQuickDownloadButton
		);

		let embedBackButton = new MessageButton()
			.setLabel("◀️")
			.setStyle("PRIMARY")
			.setCustomId(`${handshakeId}|back|handlerIgnore`)
			.setDisabled(selectedDifficultyIndex == 0);

		let embedIndicatorButton = new MessageButton()
			.setStyle("PRIMARY")
			.setCustomId(`${handshakeId}|decorator`)
			.setLabel(
				`${selectedDifficultyIndex + 1} of ${
					beatmapset.beatmaps.length
				}`
			);

		let embedSkipButton = new MessageButton()
			.setLabel("▶️")
			.setStyle("PRIMARY")
			.setCustomId(`${handshakeId}|skip|handlerIgnore`)
			.setDisabled(
				selectedDifficultyIndex + 1 == beatmapset.beatmaps.length
			);

		embedButtonsRow.setComponents(
			embedBackButton,
			embedIndicatorButton,
			embedSkipButton
		);

		function getBPMString(difficulty: BeatmapCalculationResult) {
			if (difficulty.beatmap.bpmMin == difficulty.beatmap.bpmMax)
				return Math.round(difficulty.beatmap.bpmMax);

			function parseFloatError(value: number) {
				if (value.toString().split(".")[1] && value.toString().split(".")[1].length > 2) {
					return Math.round(value);
				}

				if (value.toString().split(".").length != 0)
					return value.toFixed(2);

				return value;
			}

			return `${parseFloatError(
				difficulty.beatmap.bpmMin
			)}/${parseFloatError(difficulty.beatmap.bpmMax)}`;
		}

		/**
		 * @returns Beatmap URL or Beatmapset URL
		 */
		function getURL() {
			if (beatmap_id) return `https://osu.ppy.sh/b/${beatmap_id}`;

			return `https://osu.ppy.sh/s/${beatmapset.id}`;
		}

		async function selectDifficulty(
			sum: boolean,
			interaction?: ButtonInteraction | SelectMenuInteraction,
			refresh?: boolean
		) {
			if (!beatmapset.beatmaps) return;

			if (!refresh) {
				sum
					? (selectedDifficultyIndex += 1)
					: (selectedDifficultyIndex -= 1);
			}

			beatmapDifficulty = calculateBeatmap(
				(
					await osuApi.fetch.osuFile(
						beatmapset.beatmaps[selectedDifficultyIndex].id
					)
				).data,
				beatmapset.beatmaps[selectedDifficultyIndex].mode_int,
				mods.join("")
			);

			new MessageActionRow().setComponents(
				getModsSelector(handshakeId, mods)
			);

			embed.setDescription(
				`⭐ **SR**: \`${beatmapDifficulty.difficulty.starRating.toFixed(
					2
				)}\` | 🕒 **Duration**: \`${timeString(
					beatmapset.beatmaps[selectedDifficultyIndex].total_length
				)}\` | 🎵 **BPM**: \`${getBPMString(
					beatmapDifficulty
				)}\` | **Mods**: ${
					mods.includes("NM") ? "None" : getModsEmojis(mods)
				}`
			);

			embed.setFields(
				{
					name: `${generateColoredModeIcon(
						beatmapset.beatmaps[selectedDifficultyIndex].mode,
						beatmapDifficulty.difficulty.starRating
					)} ${beatmapset.beatmaps[selectedDifficultyIndex].version}`,
					value: getBeatmapEmbedFields(
						beatmapset.beatmaps[selectedDifficultyIndex],
						beatmapset.beatmaps[selectedDifficultyIndex].mode,
						beatmapDifficulty.beatmap,
						beatmapDifficulty.difficulty
					),
					inline: true,
				},
				{
					name: "PP by Accuracy",
					value: beatmapDifficulty.performance
						.map((p) => `${p.acc}%: \`${p.pp}pp\``)
						.join("\n"),
					inline: true,
				}
			);
			embed.setFooter({
				text: `Mapped by ${await getDifficultyMapperName(
					selectedDifficultyIndex
				)} | Last updated at ${moment(
					beatmapset.last_updated
				).fromNow()}`,
				iconURL: `https://a.ppy.sh/${beatmapset.beatmaps[selectedDifficultyIndex].user_id}`,
			});

			embedBackButton = new MessageButton()
				.setLabel("◀️")
				.setStyle("PRIMARY")
				.setCustomId(
					`${handshakeId}|back|${crypto.randomUUID()}|handlerIgnore`
				)
				.setDisabled(selectedDifficultyIndex == 0);

			embedIndicatorButton = new MessageButton()
				.setStyle("PRIMARY")
				.setCustomId(`${handshakeId}|decorator`)
				.setLabel(
					`${selectedDifficultyIndex + 1} of ${
						beatmapset.beatmaps.length
					}`
				);

			embedSkipButton = new MessageButton()
				.setLabel("▶️")
				.setStyle("PRIMARY")
				.setCustomId(
					`${handshakeId}|skip|${crypto.randomUUID()}|handlerIgnore`
				)
				.setDisabled(
					selectedDifficultyIndex + 1 == beatmapset.beatmaps.length
				);

			embedButtonsRow.setComponents(
				embedBackButton,
				embedIndicatorButton,
				embedSkipButton
			);

			if (interaction) {
				const msg = interaction.message as Message;

				msg.edit({
					embeds: [embed],
					components: [
						staticButtonsRow,
						modsSelector,
						embedButtonsRow,
					],
					allowedMentions: {
						repliedUser: false,
					},
				});
			}
		}

		const interactionCollector = new InteractionCollector(message.client, {
			channel: message.channel,
			time: 60000,
			filter: (i: ButtonInteraction | SelectMenuInteraction) =>
				i.user.id == message.author.id,
		});

		interactionCollector.on("collect", (interaction) => {
			if (!beatmapset.beatmaps) return;

			if (interaction.isButton()) {
				const handshake = interaction.customId.split("|")[0];

				if (handshake != handshakeId) return;

				const action = interaction.customId.split("|")[1];

				try {
					interaction.deferUpdate();
				} catch (e) {
					void {};
				}

				if (
					action == "skip" &&
					selectedDifficultyIndex + 1 < beatmapset.beatmaps.length
				)
					return selectDifficulty(true, interaction);

				if (action == "back" && selectedDifficultyIndex > 0)
					return selectDifficulty(false, interaction);
			}

			if (interaction.isSelectMenu()) {
				const handshake = interaction.customId.split("|")[0];

				if (handshake != handshakeId) return;

				try {
					interaction.deferUpdate();
				} catch (e) {
					void {};
				}

				mods =
					interaction.values.length == 0
						? ["NM"]
						: interaction.values;

				modsSelector = new MessageActionRow().setComponents(
					getModsSelector(handshakeId, interaction.values)
				);

				selectDifficulty(true, interaction, true);
			}
		});

		message.reply({
			embeds: [embed],
			components: [staticButtonsRow, modsSelector, embedButtonsRow],
			allowedMentions: {
				repliedUser: false,
			},
		});
	},
	// 	let index = 0;

	// 	//? Sort diffs by sr
	// 	beatmapset.beatmaps.sort((a, b) => {
	// 		return Number(a.difficulty_rating) - Number(b.difficulty_rating);
	// 	});

	// 	if (beatmap_id != "") {
	// 		const b_index = beatmapset.beatmaps.findIndex(
	// 			(b) => b.id == Number(beatmap_id)
	// 		);

	// 		if (b_index > -1) index = b_index;
	// 	}

	// 	async function generateFor(beatmap: Beatmap) {
	// 		if (!beatmapset.beatmaps)
	// 			return {
	// 				embed: new MessageEmbed(),
	// 				buttons: new MessageActionRow(),
	// 			};

	// 		const map = await axios(`https://osu.ppy.sh/osu/${beatmap.id}`);
	// 		const mapper = await osuApi.fetch.user(beatmap.user_id.toString());

	// 		if (mapper.status != 200) mapper.data.username = "---";

	// 		let beatmapResult;

	// 		switch (beatmap.mode) {
	// 			case "taiko": {
	// 				beatmapResult = calculateTaikoBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "osu": {
	// 				beatmapResult = calculateOsuBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "fruits": {
	// 				beatmapResult = calculateFruitsBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "mania": {
	// 				beatmapResult = calculateManiaBeatmap(map.data);

	// 				break;
	// 			}
	// 		}

	// 		const pps = beatmapResult.performance
	// 			.map((p: any) => `${p.acc}% \`${p.pp}pp\``)
	// 			.join(" ");

	// 		const status_icons: any = {
	// 			ranked: "https://media.discordapp.net/attachments/959908232736952420/961745250462883930/ranked.png",
	// 			loved: "https://media.discordapp.net/attachments/959908232736952420/961745251096199209/loved.png",
	// 			approved:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
	// 			qualified:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
	// 			pending:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 			wip: "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 			graveyard:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 		};

	// 		const pending_status = ["wip", "pending", "graveyard"];

	// 		const embed = new MessageEmbed({
	// 			title: `${beatmapset.artist} - ${beatmapset.title}`,
	// 			url: `https://osu.ppy.sh/s/${beatmapset.id}`,
	// 			fields: [
	// 				{
	// 					name: `${generateColoredModeIcon(
	// 						beatmap.mode,
	// 						+beatmap.difficulty_rating.toFixed(2)
	// 					)} ${beatmap.version}`,
	// 					value: getBeatmapEmbedFields(
	// 						beatmap,
	// 						beatmap.mode,
	// 						beatmapResult.beatmap,
	// 						beatmapResult.difficulty
	// 					),
	// 				},
	// 				{
	// 					name: "PP Values",
	// 					value: pps,
	// 				},
	// 			],
	// 			thumbnail: {
	// 				url: `https://b.ppy.sh/thumb/${beatmapset.id}l.jpg`,
	// 			},
	// 			author: {
	// 				name: `Difficulty ${index + 1} of ${
	// 					beatmapset.beatmaps.length
	// 				}`,
	// 				iconURL: status_icons[beatmap.status],
	// 			},
	// 			color: colors.pink,
	// 			footer: {
	// 				text: `Mapped by ${mapper.data.username} | ${
	// 					pending_status.includes(beatmapset.status)
	// 						? `${beatmapset.status} beatmap`
	// 						: `${beatmapset.status} at ${new Date(
	// 								beatmapset.ranked_date || ""
	// 						  ).toLocaleString("en-US")}`
	// 				}`,
	// 				iconURL: mapper.data.avatar_url,
	// 			},
	// 		});

	// 		if (!embed.description)
	// 			return {
	// 				embed,
	// 				buttons,
	// 			};

	// 		return {
	// 			embed,
	// 			buttons,
	// 		};
	// 	}

	// 	const buttons = new MessageActionRow();
	// 	buttons.addComponents([
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "LINK",
	// 			url: `https://osu.ppy.sh/users/${beatmapset.user_id}`,
	// 			label: "Mapper Profile",
	// 		}),
	// 	]);

	// 	// const beatmap_file = await osuApi.download.beatmapset(
	// 	// 	beatmapset.id.toString()
	// 	// );

	// 	// const stored_file = await storeBeatmap(
	// 	// 	beatmap_file,
	// 	// 	beatmapset,
	// 	// 	message
	// 	// );

	// 	// if (!stored_file.big) {
	// 	// 	buttons.addComponents([
	// 	// 		new MessageButton({
	// 	// 			type: "BUTTON",
	// 	// 			style: "LINK",
	// 	// 			url: stored_file.url,
	// 	// 			label: "Download Beatmap",
	// 	// 		}),
	// 	// 	]);
	// 	// }

	// 	const elements = await generateFor(beatmapset.beatmaps[index]);

	// 	buttons.addComponents([
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "LINK",
	// 			url: `https://axer-url.ppy.tn/dl/${beatmapset.beatmaps[0].id}`,
	// 			label: "osu!direct",
	// 		}),
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "PRIMARY",
	// 			customId: `beatmap_download|${beatmapset.id}`,
	// 			label: "Quick download",
	// 		}),
	// 	]);

	// 	message
	// 		.reply({
	// 			embeds: [elements.embed],
	// 			components: [buttons],
	// 			allowedMentions: {
	// 				repliedUser: false,
	// 			},
	// 		})
	// 		.then((msg) => {
	// 			// ? Add controls
	// 			const reactions = ["⏮", "⏭"];

	// 			reactions.forEach((emoji) => {
	// 				msg.react(emoji);
	// 			});

	// 			const collector = new ReactionCollector(msg, {
	// 				max: 100,
	// 				time: 60000,
	// 				maxUsers: 100,
	// 				idle: 60000,
	// 				filter: (r, u) => {
	// 					if (
	// 						u.id != message.author.id &&
	// 						!reactions.includes(r.emoji.name || "")
	// 					)
	// 						return false;

	// 					return true;
	// 				},
	// 			});

	// 			collector.on("collect", async (r, u) => {
	// 				if (!beatmapset.beatmaps) return;

	// 				if (u.id != message.author.id) return;

	// 				if (r.emoji.name == "⏮" && index > 0) {
	// 					index--;

	// 					const new_components = await generateFor(
	// 						beatmapset.beatmaps[index]
	// 					);

	// 					msg.edit({
	// 						embeds: [new_components.embed],
	// 						components: [new_components.buttons],
	// 						allowedMentions: {
	// 							repliedUser: false,
	// 						},
	// 					});
	// 				}

	// 				if (
	// 					r.emoji.name == "⏭" &&
	// 					index + 1 < beatmapset.beatmaps.length
	// 				) {
	// 					index++;

	// 					const new_components = await generateFor(
	// 						beatmapset.beatmaps[index]
	// 					);

	// 					msg.edit({
	// 						embeds: [new_components.embed],
	// 						components: [new_components.buttons],
	// 						allowedMentions: {
	// 							repliedUser: false,
	// 						},
	// 					});
	// 				}
	// 			});

	// 			collector.on("remove", async (r, u) => {
	// 				if (!beatmapset.beatmaps) return;

	// 				if (u.id != message.author.id) return;

	// 				if (r.emoji.name == "⏮" && index > 0) {
	// 					index--;

	// 					const new_components = await generateFor(
	// 						beatmapset.beatmaps[index]
	// 					);

	// 					msg.edit({
	// 						embeds: [new_components.embed],
	// 						components: [new_components.buttons],
	// 						allowedMentions: {
	// 							repliedUser: false,
	// 						},
	// 					});
	// 				}

	// 				if (
	// 					r.emoji.name == "⏭" &&
	// 					index + 1 < beatmapset.beatmaps.length
	// 				) {
	// 					index++;

	// 					const new_components = await generateFor(
	// 						beatmapset.beatmaps[index]
	// 					);

	// 					msg.edit({
	// 						embeds: [new_components.embed],
	// 						components: [new_components.buttons],
	// 						allowedMentions: {
	// 							repliedUser: false,
	// 						},
	// 					});
	// 				}
	// 			});
	// 		});
	// },
	// reply: async (
	// 	beatmapset: Beatmapset,
	// 	beatmap_id: string,
	// 	interaction: ContextMenuInteraction | CommandInteraction,
	// 	mode: "osu" | "taiko" | "mania" | "fruits" | "",
	// 	ephemeral?: boolean
	// ) => {
	// 	if (!beatmapset.beatmaps) return;
	// 	let index = 0;

	// 	//? Sort diffs by sr
	// 	beatmapset.beatmaps.sort((a, b) => {
	// 		return Number(a.difficulty_rating) - Number(b.difficulty_rating);
	// 	});

	// 	if (beatmap_id != "") {
	// 		const b_index = beatmapset.beatmaps.findIndex(
	// 			(b) => b.id == Number(beatmap_id)
	// 		);

	// 		if (b_index > -1) index = b_index;
	// 	}

	// 	async function generateFor(beatmap: Beatmap) {
	// 		if (!beatmapset.beatmaps)
	// 			return {
	// 				embed: new MessageEmbed(),
	// 				buttons: new MessageActionRow(),
	// 			};

	// 		const map = await axios(`https://osu.ppy.sh/osu/${beatmap.id}`);
	// 		const mapper = await osuApi.fetch.user(beatmap.user_id.toString());

	// 		if (mapper.status != 200) mapper.data.username = "---";

	// 		let beatmapResult;

	// 		switch (beatmap.mode) {
	// 			case "taiko": {
	// 				beatmapResult = calculateTaikoBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "osu": {
	// 				beatmapResult = calculateOsuBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "fruits": {
	// 				beatmapResult = calculateFruitsBeatmap(map.data);

	// 				break;
	// 			}
	// 			case "mania": {
	// 				beatmapResult = calculateManiaBeatmap(map.data);

	// 				break;
	// 			}
	// 		}

	// 		const pps = beatmapResult.performance
	// 			.map((p: any) => `${p.acc}% \`${p.pp}pp\``)
	// 			.join(" ");

	// 		const status_icons: any = {
	// 			ranked: "https://media.discordapp.net/attachments/959908232736952420/961745250462883930/ranked.png",
	// 			loved: "https://media.discordapp.net/attachments/959908232736952420/961745251096199209/loved.png",
	// 			approved:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
	// 			qualified:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250878099456/qualified.png",
	// 			pending:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 			wip: "https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 			graveyard:
	// 				"https://media.discordapp.net/attachments/959908232736952420/961745250672603146/pending.png",
	// 		};

	// 		const pending_status = ["wip", "pending", "graveyard"];

	// 		const embed = new MessageEmbed({
	// 			title: `${beatmapset.artist} - ${beatmapset.title}`,
	// 			url: `https://osu.ppy.sh/s/${beatmapset.id}`,
	// 			fields: [
	// 				{
	// 					name: `${getEmoji(beatmap.mode)} ${beatmap.version}`,
	// 					value: getBeatmapEmbedFields(
	// 						beatmap,
	// 						beatmap.mode,
	// 						beatmapResult.beatmap,
	// 						beatmapResult.difficulty
	// 					),
	// 				},
	// 				{
	// 					name: "PP Values",
	// 					value: pps,
	// 				},
	// 			],
	// 			thumbnail: {
	// 				url: `https://b.ppy.sh/thumb/${beatmapset.id}l.jpg`,
	// 			},
	// 			author: {
	// 				name: `Difficulty ${index + 1} of ${
	// 					beatmapset.beatmaps.length
	// 				}`,
	// 				iconURL: status_icons[beatmap.status],
	// 			},
	// 			color: colors.pink,
	// 			footer: {
	// 				text: `Mapped by ${mapper.data.username} | ${
	// 					pending_status.includes(beatmapset.status)
	// 						? `${beatmapset.status} beatmap`
	// 						: `${beatmapset.status} at ${new Date(
	// 								beatmapset.ranked_date || ""
	// 						  ).toLocaleString("en-US")}`
	// 				}`,
	// 				iconURL: mapper.data.avatar_url,
	// 			},
	// 		});

	// 		if (!embed.description)
	// 			return {
	// 				embed,
	// 				buttons,
	// 			};

	// 		return {
	// 			embed,
	// 			buttons,
	// 		};
	// 	}

	// 	const buttons = new MessageActionRow();
	// 	buttons.addComponents([
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "LINK",
	// 			url: `https://osu.ppy.sh/users/${beatmapset.user_id}`,
	// 			label: "Mapper Profile",
	// 		}),
	// 	]);

	// 	const elements = await generateFor(beatmapset.beatmaps[index]);

	// 	buttons.addComponents([
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "LINK",
	// 			url: `https://axer-url.ppy.tn/dl/${beatmapset.beatmaps[0].id}`,
	// 			label: "osu!direct",
	// 		}),
	// 		new MessageButton({
	// 			type: "BUTTON",
	// 			style: "PRIMARY",
	// 			customId: `beatmap_download|${beatmapset.id}`,
	// 			label: "Quick download",
	// 		}),
	// 	]);

	// 	interaction
	// 		.reply({
	// 			embeds: [elements.embed],
	// 			components: [buttons],
	// 			allowedMentions: {
	// 				repliedUser: false,
	// 			},
	// 			ephemeral: ephemeral || false,
	// 		})
	// 		.catch(console.error);
	// },
};
