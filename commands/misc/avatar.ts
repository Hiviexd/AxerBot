import { Client, Message, MessageEmbed, User } from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";

export default {
    name: "avatar",
    help: {
        description: "Displays the avatar of the mentioned user or the author.",
        syntax: "!avatar <option>",
        example: "{prefix}avatar\n {prefix}avatar @Hivie\n {prefix}avatar <userid>",
    },
    category: "misc",
    run: async (bot: Client, message: Message, args: string[]) => {
        const target = !isNaN(Number(args[0]))
            ? Number(args[0])
            : message.mentions.users.first() || message.author;

        let user: User;

        if (typeof target == "number") {
            try {
                user = await bot.users.fetch(target.toString());
            } catch (e) {
                return message.channel.send({ embeds: [UserNotFound] });
            }
        } else {
            user = target;
        }
        const avatarEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle(`${user.tag}'s avatar`)
            .setImage(user.displayAvatarURL({ format: "png", dynamic: true }))
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ format: "png", dynamic: true }));
            message.channel.send({embeds: [avatarEmbed]}).catch(console.error);
        
    },
};