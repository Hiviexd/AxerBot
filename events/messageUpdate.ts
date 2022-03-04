import { Client, GuildChannel, Message, MessageEmbed } from "discord.js";

export default {
	name: "messageUpdate",
	execute(bot: Client) {
		bot.on("messageUpdate", (oldMessage, newMessage) => {
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

			if (
				!newMessage.guild.channels.cache.find(
					(c) => c.name === "wasteland"
				)
			)
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

			let channel: any = newMessage.guild.channels.cache
				.filter((c) => c.name == "wasteland")
				.first();

			channel.send({ embeds: [embed] });
		});
	},
};
