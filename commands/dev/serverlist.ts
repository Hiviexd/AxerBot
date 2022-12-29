import { Client, Message, MessageEmbed, ReactionCollector } from "discord.js";
import { owners } from "../../config.json";
import { Paginator } from "array-paginator";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../constants/colors";

export default {
	name: "serverlist",
	help: {
		description:
			"Developer-exclusive command that shows a list of all servers the bot is in.",
		syntax: "/serverlist",
	},
	category: "dev",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (owners.includes(message.author.id)) {
			const guilds = bot.guilds.cache.map((guild) => {
				return {
					name: guild.name,
					id: guild.id,
					icon: guild.iconURL({ format: "png", dynamic: true }),
					members: guild.memberCount,
					created: guild.createdAt.toDateString(),
					memberCount: guild.memberCount,
				};
			});

			const serversPagination = new Paginator(guilds, 4);

			function generateFor(pageData: any[] | undefined) {
				if (!pageData) return;

				const embed = new MessageEmbed()
					.setColor(colors.blue)
					.setTitle("Server List")
					.setDescription(
						"This is a list of all the servers the bot is in."
					)
					.setFooter(
						`Page ${serversPagination.current}/${serversPagination.totalPages}`
					);

				embed.addFields(
					pageData.map((guild) => {
						return {
							name: `**Name:** \`${guild.name}\``,
							value: `**Member Count:** \`${guild.members}\`\n**Created at:** \`${guild.created}\``,
						};
					})
				);

				return embed;
			}

			const firstEmbed = generateFor(serversPagination.page(1));

			if (!firstEmbed) return;

			message.channel.send({ embeds: [firstEmbed] }).then((msg) => {
				let index = 1;

				// ? Add controls
				const reactions = ["⏮", "⏭"];

				reactions.forEach((emoji) => {
					msg.react(emoji);
				});

				const collector = new ReactionCollector(msg, {
					max: 100,
					time: 60000,
					maxUsers: 100,
					idle: 60000,
					filter: (r, u) => {
						if (
							u.id != message.author.id &&
							!reactions.includes(r.emoji.name || "")
						)
							return false;

						return true;
					},
				});

				collector.on("collect", async (r, u) => {
					if (!serversPagination) return;

					if (u.id != message.author.id) return;

					if (r.emoji.name == "⏮" && index > 1) {
						index--;

						const newEmbed = generateFor(
							serversPagination.page(index)
						);

						if (!newEmbed) {
							index++;
							return;
						}

						msg.edit({
							embeds: [newEmbed],
							allowedMentions: {
								repliedUser: false,
							},
						});
					}

					if (
						r.emoji.name == "⏭" &&
						index + 1 < (serversPagination.totalPages || 0)
					) {
						index++;

						const newEmbed = generateFor(
							serversPagination.page(index)
						);

						if (!newEmbed) {
							index--;
							return;
						}

						msg.edit({
							embeds: [newEmbed],
							allowedMentions: {
								repliedUser: false,
							},
						});
					}
				});

				collector.on("remove", async (r, u) => {
					if (!serversPagination) return;

					if (u.id != message.author.id) return;

					if (r.emoji.name == "⏮" && index > 1) {
						index--;

						const newEmbed = generateFor(
							serversPagination.page(index)
						);

						if (!newEmbed) {
							index++;
							return;
						}

						msg.edit({
							embeds: [newEmbed],
							allowedMentions: {
								repliedUser: false,
							},
						});
					}

					if (
						r.emoji.name == "⏭" &&
						index + 1 < (serversPagination.totalPages || 0)
					) {
						index++;

						const newEmbed = generateFor(
							serversPagination.page(index)
						);

						if (!newEmbed) {
							index--;
							return;
						}

						msg.edit({
							embeds: [newEmbed],
							allowedMentions: {
								repliedUser: false,
							},
						});
					}
				});
			});
		} else {
			message.reply({
				embeds: [
					generateErrorEmbed(
						"❌ **Only bot developers allowed to use this!**"
					),
				],
			});
		}
	},
};
