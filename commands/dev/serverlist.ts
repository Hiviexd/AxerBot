import { Client, Message, MessageEmbed } from "discord.js";
import { owners } from "../../config.json";

export default {
	name: "serverlist",
	help: {
		description: "Developer-exclusive command that shows a list of all servers the bot is in.",
		syntax: "{prefix}serverlist",
	},
	category: "dev",
	run: async (bot: Client, message: Message, args: string[]) => {
		if (owners.includes(message.author.id)) {
            const embed = new MessageEmbed()
                .setColor("#0099ff")
                .setTitle("Server List")
                .setDescription("This is a list of all the servers the bot is in.");
            const guilds = bot.guilds.cache.map(guild => {
                return {
                    name: guild.name,
                    id: guild.id,
                    icon: guild.iconURL({ format: "png", dynamic: true }),
                    members: guild.memberCount,
                    created: guild.createdAt.toDateString(),
                    memberCount: guild.memberCount}});
            embed.addFields(guilds.map(guild => {
                return {
                    name: `**Name:** \`${guild.name}\``,
                    value: `**Member Count:** \`${guild.members}\`\n**Created at:** \`${guild.created}\``,
                }
            }));
            message.channel.send({embeds: [embed]});

        } else {
            message.reply("❌ | **You can't use this!**");
        }
    },
};