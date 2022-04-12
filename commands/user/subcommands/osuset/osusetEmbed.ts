import { Message, MessageEmbed } from "discord.js";
import createNewUser from "../../../../database/utils/createNewUser";
import * as database from "./../../../../database";

export default {
	name: "osuset embed",
	trigger: ["embed"],
	help: {
		description: "Set embed to send after your profile url is detected.",
		syntax: "{prefix}osuset `embed` `<type>`",
	},
	run: async (message: Message, args: string[]) => {
		if (args.length != 1)
			return message.channel.send(
				"❗ Please, provide a valid embed option to set! (`player` or `mapper`)"
			);

		const validEmbeds = ["mapper", "player"];
		if (!validEmbeds.includes(args[0]))
			return message.channel.send(
				"❗ Please, provide a valid embed option to set! (`player` or `mapper`)"
			);

		let user = await database.users.findOne({ _id: message.author.id });

		if (user == null) await createNewUser(message.author);

		user = await database.users.findOne({ _id: message.author.id });

		user.osu.embed = args[0].toLowerCase();

		await database.users.findOneAndUpdate({ _id: message.author.id }, user);

		const res = new MessageEmbed()
			.setTitle("✅ Configuration updated!")
			.setDescription(
				`Now, after i detect your osu! profile url i will send your **${args[0]}** info`
			)
			.setColor("#1df27d");

		return message.channel.send({
			embeds: [res],
		});
	},
};
