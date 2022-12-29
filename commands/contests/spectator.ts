import { Client, Message } from "discord.js";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import { ownerId } from "../../config.json";

export default {
	name: "spectator",
	help: {
		description:
			"Gives the Verified + Spectator role to a user (and sets a new nickname when given)",
		syntax: "/spectator `@user` \n/spectator `@user` `<nickname>`",
		example: "/spectator `@Sebola`\n/spectator `@Nifty1234` `Nifty`",
	},
	category: "contests",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member || !message.guild || !message.mentions.members)
			return;
		if (
			!message.member.permissions.has("MANAGE_MESSAGES", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let spectator = message.guild.roles.cache.find(
			(r) => r.name === "Spectator"
		);
		let verified = message.guild.roles.cache.find(
			(r) => r.name === "Verified"
		);
		let member = message.mentions.members.first();
		args.shift();
		let nickname = args.join(" ");

		if (!member || !verified || !spectator) return;

		if (!nickname) {
			member.roles.add(verified).catch((err) => {
				message.channel.send(":x: Error setting verified role.");
			});
			member.roles.add(spectator).catch((err) => {
				message.channel.send(":x: Error setting spectator role.");
			});
			message.channel.send(`:white_check_mark: Applied roles!`);
			return;
		}

		if (args.length < 1) {
			let msg = await message.channel.send(
				":exclamation: **Syntax:** ``!spectator @user <nickname>``"
			);
			setTimeout(() => {
				msg.delete();
			}, 3000);
			return;
		}

		member.roles.add(verified).catch((err) => {
			message.channel.send(":x: Error setting verified role.");
		});
		member.roles.add(spectator).catch((err) => {
			message.channel.send(":x: Error setting spectator role.");
		});

		member.setNickname(nickname).catch((err) => {
			message.channel.send(":x: Error setting nickname.");
		});

		message.channel.send(
			`:white_check_mark: Applied role and changed nickname to **${nickname}**!`
		);
	},
};
