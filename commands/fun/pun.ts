import {
    Client,
    Message,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import axios from "axios";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../constants/colors";
import { SlashCommand } from "../../models/commands/SlashCommand";

const pun = new SlashCommand(
    ["pun", "joke"],
    "Get a random pun!",
    "Fun",
    false
);

pun.setExecuteFunction(async (command) => {
    await command.deferReply();

    const config = {
        headers: {
            Accept: "application/json",
            "user-agent": "Axerbot",
        },
    };
    const url = "https://icanhazdadjoke.com/";

    try {
        const req = await axios.get(url, config);
        command.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🗿 Pun")
                    .setDescription(req.data.joke)
                    .setColor(colors.blue),
            ],
        });
    } catch (e) {
        command.editReply({
            embeds: [
                generateErrorEmbed(
                    `❌ A server error occured, try again later.`
                ),
            ],
        });
    }
});

export default pun;
