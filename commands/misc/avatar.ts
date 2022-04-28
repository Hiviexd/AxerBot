import { Client, Message, MessageEmbed } from "discord.js";

export default {
	name: "avatar",
	help: {
		description: "Displays the avatar of the mentioned user or the author.",
		example: "{prefix}avatar\n {prefix}avatar @Hivie",
	},
	category: "misc",
	run: async (bot: Client, message: Message, args: string[]) => {
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle(`${user.username}'s avatar`)
            .setImage(user.displayAvatarURL({ format: "png", dynamic: true }));
            message.channel.send({embeds: [avatarEmbed]}).catch(console.error);
        
    },
};