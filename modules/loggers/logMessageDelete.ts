import { MessageEmbed, Message, PartialMessage } from "discord.js";
import * as database from "../../database";
import truncateString from "../../helpers/text/truncateString";

export default async (message: Message<boolean> | PartialMessage) => {
	try {
		if (!message.author) return;
		if (message.author.bot) return;
		if (message.channel.type === "DM") return;
		if (!message.member) return;
		if (!message.guild || !message.guild.channels) return;
		if (!message.cleanContent) return;

		const guild = await database.guilds.findOne({
			_id: message.guild.id,
		});

		if (!guild) return;
		if (guild.logging.enabled === false) return;
		if (!message.guild.channels.cache.get(guild.logging.channel)) return;

		const count = 1950;

		const truncatedMessage = truncateString(message.cleanContent, count);

		const embed = new MessageEmbed()
			.setColor("#ff5050")
			.setAuthor({
				name: message.member.nickname
					? `${message.member.nickname} (${message.author.tag})`
					: message.author.tag,
				iconURL: message.author.displayAvatarURL(),
			})
			.setDescription(
				`:x:  deleted a message from ${message.channel}\n\n**Message:** \n${truncatedMessage}`
			)
			.addField("Message id", message.id, true)
			.addField("Message link", `[Message](${message.url})`, true)
			.addField("\u200b", "\u200b", true)
			.addField("Channel id", message.channel.id, true)
			.addField("Channel name", message.channel.name, true)
			.addField("\u200b", "\u200b", true)
			.addField("User id", message.member.id, true)
			.addField("User tag", message.member.user.tag, true)
			.setTimestamp();
		message.member.nickname
			? embed.addField("Nickname", message.member.nickname, true)
			: embed.addField("\u200b", "\u200b", true);

		if (message.attachments.size > 0) {
			const img = message.attachments.first()?.url;

			if (img) {
				embed.setImage(img);
			}
		}

		const channel: any = message.guild.channels.cache.get(
			guild.logging.channel
		);
		if (!channel) return;

		channel.send({ embeds: [embed] });
	} catch (e) {
		console.error(e);
	}
};
