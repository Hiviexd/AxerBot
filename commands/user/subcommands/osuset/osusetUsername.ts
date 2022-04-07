import { Message, MessageEmbed } from "discord.js";
import createNewUser from "../../../../database/utils/createNewUser";
import * as database from "../../../../database";

export default {
	name: "osuset user",
	trigger: ["user"],
	help: {
		description: "Set username to send after your profile url is detected.",
		syntax: "{prefix}osuset `user` `type`",
	},
	run: async (message: Message, args: string[]) => {
		if (args.length < 1)
			return message.channel.send(
				"❗ Please, provide a valid username to set!"
			);

		let user = await database.users.findOne({ _id: message.author.id });

		if (user == null) await createNewUser(message.author);

		user = await database.users.findOne({ _id: message.author.id });

		user.osu.username = args.join(" ").toLowerCase();

		await database.users.findOneAndUpdate({ _id: message.author.id }, user);

		const res = new MessageEmbed()
			.setTitle("✅ Configuration updated!")
			.setDescription(`Username changed to **${user.osu.username}**`)
			.setColor("#1df27d");

		return message.channel.send({
			embeds: [res],
		});
	},
};
