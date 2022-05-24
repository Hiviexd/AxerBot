import { Client, Message, MessageEmbed } from "discord.js";
import axios from "axios";

export default {
	name: "fact",
	help: {
		description: "Get a random fact!",
		syntax: "{prefix}fact",
        options: `\`today\`: Gets the fact of the day.`,
        example: `{prefix}fact\n {prefix}fact today`,

	},
	category: "fun",
	run: async (bot: Client, message: Message, args: string[]) => {
        if (args.length > 0) {
            if (args[0] == "today") {
                axios.get(`https://uselessfacts.jsph.pl/today.json?language=en`).then(async (res) => {
                    const fact = res.data.text;
                    const embed = new MessageEmbed({
                        title: "Fact of the Day",
                        description: fact,
                        color: "#ffac00",
                        footer: {
                            text: `Feeling lucky? Try the command \"fact\" for a random fact!`
                        }
                    });
                    message.channel.send({embeds: [embed]}).catch(console.error);

                }).catch(console.error);
            }
        } else {
            axios.get(`https://uselessfacts.jsph.pl/random.json?language=en`).then(async (res) => {
                const fact = res.data.text;
                const embed = new MessageEmbed({
                    title: "Random Fact",
                    description: fact,
                    color: "#0080ff",
                    footer: {
                        text: `Check out today's fact with the command \"fact today\"!`
                    }
                });
                message.channel.send({embeds: [embed]}).catch(console.error);
            }).catch(console.error);
        }
    }
}




