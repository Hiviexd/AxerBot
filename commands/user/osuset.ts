import { Client, Message, MessageEmbed } from "discord.js";
import createNewUser from "../../database/utils/createNewUser";
import * as database from "./../../database";
import osusetEmbed from "./subcommands/osuset/osusetEmbed";
import osusetUsername from "./subcommands/osuset/osusetUsername";

export default {
	name: "osuset",
	help: {
		description: "Sets your credentials so the bot recognizes you.",
		syntax: "{prefix}osuset `<field>` `<value>`",
		example:
			"{prefix}osuset `user` `Hivie`\n {prefix}osuset `user` `HEAVENLY MOON`",
	},
	category: "osu",
	subcommands: [osusetEmbed, osusetUsername],
	run: async (bot: Client, message: Message, args: Array<string>) => {
		const validOptions = ["user", "embed"];

		if (args.length < 1)
			return message.channel.send(
				"❗ Please, provide a valid option to set"
			);

		const options = {
			category: args.shift(),
			value: args.join(" "),
		};

		if (!options.category || !options.value)
			return message.channel.send("❗ Provide a valid argument to set.");

		if (!validOptions.includes(options.category.toLowerCase()))
			return message.channel.send("❌ Invalid option.");

		let user = await database.users.findOne({ _id: message.author.id });

		if (user == null) await createNewUser(message.author);

		user = await database.users.findOne({ _id: message.author.id });

		switch (options.category) {
			case "user": {
				user.osu["username"] = options.value.toLowerCase();
				break;
			}

			case "embed": {
				const validEmbeds = ["mapper", "player"];

				if (!validEmbeds.includes(options.value))
					return message.channel.send(
						"❌ Invalid embed! Valid options: `player` `mapper`"
					);

				user.osu["embed"] = options.value;
				break;
			}
		}

		await database.users.findOneAndUpdate({ _id: message.author.id }, user);

		const res = new MessageEmbed()
			.setTitle("✅ Configuration updated!")
			.setDescription(
				`now, your **${options.category}** is \`${options.value}\``
			)
			.setColor("#1df27d");

		return message.channel.send({
			embeds: [res],
		});
	},
};
