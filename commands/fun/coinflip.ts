import { Client, CommandInteraction, GuildMember } from "discord.js";

export default {
	name: "coinflip",
	help: {
		description: "Feeling lucky? Flip a coin!",
		syntax: "/coinflip",
	},
	interaction: true,
	config: {
		type: 1,
	},
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();
		let coin = Math.floor(Math.random() * 2);

		//return nothing if command.member isn't GuildMember
		if (!(command.member instanceof GuildMember)) return;

		command.editReply(
			`**${
				command.member?.nickname
					? command.member.nickname
					: command.user.username
			}**'s coin landed on **${coin === 0 ? "Heads" : "Tails"}**!`
		);
	},
};
