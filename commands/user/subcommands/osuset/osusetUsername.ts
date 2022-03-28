import { Message, MessageEmbed } from "discord.js";
import createNewUser from "../../../../database/utils/createNewUser";
import * as database from "../../../../database";

export const config = {
	name: "user",
	description: "Set username to send after your profile url is detected.",
	syntax: "!osuset `user` `type`",
	trigger: ["user"],
};

export async function run(message: Message, args: string[]) {
	if (args.length != 1)
		return message.channel.send(
			"❗ Please, provide a valid username to set!"
		);

	let user = await database.users.findOne({ _id: message.author.id });

	if (user == null) await createNewUser(message.author);

	user = await database.users.findOne({ _id: message.author.id });

	user.osu.username = args[0].toLowerCase();

	await database.users.findOneAndUpdate({ _id: message.author.id }, user);

	const res = new MessageEmbed()
		.setTitle("✅ Configuration updated!")
		.setDescription(`Username changed to **${args[0]}**`)
		.setColor("#1df27d");

	return message.channel.send({
		embeds: [res],
	});
}
