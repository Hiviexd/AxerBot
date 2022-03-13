import { Client, Message, MessageEmbed } from "discord.js";

export default {
	name: "messageDelete",
	execute(bot: Client) {
		try {
			bot.on("messageDelete", (message) => {
				if (!message.author) return;
				if (message.author.bot) return;
				if (message.channel.type === "DM") return;
				if (!message.guild || !message.guild.channels) return;

				const embed = new MessageEmbed()
					.setColor("#ff5050")
					.setAuthor(
						`${message.author.username}`,
						message.author.displayAvatarURL()
					)
					.setDescription(
						`:x:  deleted a message from ${message.channel}\n\n**Message:** \n${message.cleanContent}`
					)
					.setTimestamp();

				if (message.attachments.size > 0) {
					const img = message.attachments.first()?.url;

					if (img) {
						embed.setImage(img);
					}
				}

				const channel: any = message.guild.channels.cache
					.filter((c) => c.name === "wasteland")
					.first();

				if (!channel) return;

				channel.send({ embeds: [embed] });
			});
		} catch (e: any) {
			console.error(e);
		}
	},
};
