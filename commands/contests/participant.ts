import { Client, Message } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions"
import { ownerId } from "../../config.json";

export default {
	name: "participant",
	description: "Gives the Verified + Participant role to a user (and sets a new nickname when given)",
	syntax: "!participant `@user` \n!participant `@user` `<nickname>`",
	example: "!participant `@Sebola`\n!participant `@Nifty1234` `Nifty`", 
	category: "contests",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (!message.member || !message.guild || !message.mentions.members) return;
		if ((!message.member.permissions.has("MANAGE_MESSAGES", true)) && (message.author.id !== ownerId)) return message.channel.send({embeds: [MissingPermissions]});

		let participant = message.guild.roles.cache.find(
			(r) => r.name === "Participant"
		);
		let verified = message.guild.roles.cache.find(
			(r) => r.name === "Verified"
		);
		let member = message.mentions.members.first();
		args.shift();
		let nickname = args.join(" ");

		if (!member || !verified || !participant) return;

		if (!nickname) {
			member.roles.add(verified).catch((err) => {
				message.channel.send(":x: Error setting verified role.");
			});
			member.roles.add(participant).catch((err) => {
				message.channel.send(":x: Error setting participant role.");
			});
			message.channel.send(`:white_check_mark: Applied roles!`);
			return;
		}

		if (args.length < 1) {
			let msg = await message.channel.send(
				":exclamation: **Syntax:** ``!participant @user <nickname>``"
			);
			setTimeout(() => {
				msg.delete();
			}, 3000);
			return;
		}

		member.roles.add(verified).catch((err) => {
			message.channel.send(":x: Error setting verified role.");
		});
		member.roles.add(participant).catch((err) => {
			message.channel.send(":x: Error setting participant role.");
		});

		member.setNickname(nickname).catch((err) => {
			message.channel.send(":x: Error setting nickname.");
		});

		message.channel.send(
			`:white_check_mark: Applied roles and changed nickname to **${nickname}**!`
		);
	},
};
