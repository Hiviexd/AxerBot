import { MessageEmbed, Message, PartialMessage } from "discord.js";
import * as database from "../../database";
import truncateString from "../../helpers/text/truncateString";
import colors from "../../constants/colors";

export default async (
	oldMessage: Message<boolean> | PartialMessage,
	newMessage: Message<boolean> | PartialMessage
) => {
	try {
		// TODO: add proper console logs to these errors
		if (
			!oldMessage.author ||
			!oldMessage.content ||
			!oldMessage.cleanContent ||
			!oldMessage.guild ||
			oldMessage.author.bot ||
			oldMessage.channel.type === "DM" ||
			!newMessage.content ||
			!newMessage.author ||
			!newMessage.cleanContent ||
			!newMessage.guild ||
			!newMessage.member
		)
			return;

		const guild = await database.guilds.findOne({
			_id: oldMessage.guild.id,
		});
		if (!guild) return;

		if (guild.logging.enabled === false) return;

		if (!newMessage.guild.channels.cache.get(guild.logging.channel)) return;
		if (oldMessage.content === newMessage.content) return;

		const count = 1950;

		const original = truncateString(oldMessage.cleanContent, count);

		const edited = truncateString(newMessage.cleanContent, count);

		const embed = new MessageEmbed()
			.setColor(colors.blue)
			.setAuthor({
				name: newMessage.member.nickname
					? `${newMessage.member.nickname} (${newMessage.author.tag})`
					: newMessage.author.tag,
				iconURL: newMessage.author.displayAvatarURL(),
			})
			.setDescription(
				`📝 ${newMessage.member.user} edited a message in ${newMessage.channel}\n\n**Before:** \n${original}\n\n**After:** \n${edited}\n`
			)
			.addField("Message id", newMessage.id, true)
			.addField("Message link", `[Message](${newMessage.url})`, true)
			.addField("\u200b", "\u200b", true)
			.addField("Channel id", newMessage.channel.id, true)
			.addField("Channel name", oldMessage.channel.name, true)
			.addField("\u200b", "\u200b", true)
			.addField("User id", newMessage.member.id, true)
			.addField("User tag", newMessage.member.user.tag, true)
			.setTimestamp();
		newMessage.member.nickname
			? embed.addField("Nickname", newMessage.member.nickname, true)
			: embed.addField("\u200b", "\u200b", true);

		if (newMessage.attachments.size > 0) {
			let img: any = newMessage.attachments.first();
			embed.setImage(img.url);
		}

		let channel: any = newMessage.guild.channels.cache.get(
			guild.logging.channel
		);

		if (!channel) return;

		channel.send({ embeds: [embed] });
	} catch (e) {
		console.error(e);
	}
};
