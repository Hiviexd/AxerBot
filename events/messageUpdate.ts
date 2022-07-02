import { Client, GuildChannel, Message, MessageEmbed } from "discord.js";
import * as database from "../database";

export default {
	name: "messageUpdate",
	execute(bot: Client) {
		try {
			bot.on("messageUpdate", async (oldMessage, newMessage) => {
				if (
					!oldMessage.author ||
					!oldMessage.content ||
					!newMessage.content ||
					!newMessage.author
				)
					return;
				if (oldMessage.author.bot) return;
				if (oldMessage.channel.type === "DM") return;
				if (!oldMessage.author) return;
				if (!newMessage.guild || !oldMessage.guild) return;

				const guild = await database.guilds.findOne({
					_id: oldMessage.guild.id,
				});
				if (!guild) return;

				if (guild.logging.enabled === false) return;

				if (!newMessage.guild.channels.cache.get(guild.logging.channel))
					return;
				if (oldMessage.content === newMessage.content) return;

				const count = 1950;
				const original =
					oldMessage.content.slice(0, count) +
					(oldMessage.content.length > count ? "..." : "");
				const edited =
					newMessage.content.slice(0, count) +
					(newMessage.content.length > count ? "..." : "");

				const embed = new MessageEmbed()
					.setColor("#008cff")
					.setAuthor(
						`${newMessage.author.username}`,
						newMessage.author.displayAvatarURL()
					)
					.setDescription(
						`:pencil:  edited a message in ${newMessage.channel}\n\n**Before:** \n${original}\n\n**After:** \n${edited}\n`
					)
					.setTimestamp();

				if (newMessage.attachments.size > 0) {
					let img: any = newMessage.attachments.first();
					embed.setImage(img.url);
				}

				let channel: any = newMessage.guild.channels.cache.get(
					guild.logging.channel
				);

				if (!channel) return;

				channel.send({ embeds: [embed] });
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
