import axios from "axios";
import { EmbedBuilder, SlashCommandStringOption } from "discord.js";
import colors from "../../constants/colors";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const fact = new SlashCommand()
    .setName("fact")
    .setDescription("Get a random fact!")
    .setCategory(CommandCategory.Fun)
    .setHelp({
        options: `\`today\`: Gets the fact of the day.`,
        example: `/fact\n /fact type:today`,
    })
    .addOptions(
        new SlashCommandStringOption()
            .setName("type")
            .setDescription("Daily or random?")
            .addChoices(
                {
                    name: "daily",
                    value: "today",
                },
                {
                    name: "random",
                    value: "random",
                }
            )
    )
    .setDMPermission(true);

fact.setExecutable(async (command) => {
    let type = command.options.getString("type") ?? "random";

    if (type == "today") {
        axios(`https://uselessfacts.jsph.pl/today.json?language=en`)
            .then(async (res) => {
                const fact = res.data.text;
                const embed = new EmbedBuilder({
                    title: "🌟 Fact of the Day",
                    description: fact.replace(/`/g, "'"),
                    footer: {
                        text: `Feeling lucky? Try \"/fact\" for a random fact!`,
                    },
                }).setColor(colors.gold);
                command.editReply({ embeds: [embed] }).catch(console.error);
            })
            .catch(console.error);
    } else {
        axios
            .get(`https://uselessfacts.jsph.pl/random.json?language=en`)
            .then(async (res) => {
                const fact = res.data.text;
                const embed = new EmbedBuilder({
                    title: "📘 Random Fact",
                    description: fact.replace(/`/g, "'"),
                    footer: {
                        text: `Check out today's fact with \"/fact type:daily\"!`,
                    },
                }).setColor(colors.blue);
                command.editReply({ embeds: [embed] }).catch(console.error);
            })
            .catch(console.error);
    }
});

export { fact };
