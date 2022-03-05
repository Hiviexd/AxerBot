import { Client, Message, MessageEmbed } from "discord.js";
import createNewUser from "../../database/utils/createNewUser";
import * as database from "./../../database";

export default {
	name: "mapper",
	run: async (bot: Client, message: Message, args: Array<string>) => {
		const validOptions = ["user"];

		if (args.length < 1)
			return message.channel.send(
				"Please, provide a valid option to set"
			);

		const options = {
			category: args[0],
			value: args[1],
		};

		if (!options.category || !options.value)
			return message.channel.send("Provide a valid argument to set");

		if (!validOptions.includes(options.category.toLowerCase()))
			return message.channel.send("Invalid option.");

		let user = await database.users.findOne({ _id: message.author.id });

		if (user == null) await createNewUser(message.author);

		user = await database.users.findOne({ _id: message.author.id });

		switch (options.category) {
			case "user": {
				user.osu["username"] = options.value;
				break;
			}
		}

		await database.users.findOneAndUpdate({ _id: message.author.id }, user);

		const res = new MessageEmbed()
			.setTitle("✅ Configuration updated!")
			.setDescription(`now, your **${options.category}** is \`${options.value}\``
			)
			.setColor("#1df27d")

		return message.channel.send({
			embeds: [res],
		});
	},
};
