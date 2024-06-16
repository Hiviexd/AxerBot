import { EmbedBuilder } from "discord.js";
import axios from "axios";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import colors from "../../constants/colors";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const pun = new SlashCommand()
    .setName("pun")
    .setNameAliases(["joke"])
    .setDescription("Get a random pun!")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true);

pun.setExecutable(async (command) => {
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
            embeds: [generateErrorEmbed(`❌ A server error occured, try again later.`)],
        });
    }
});

export { pun };
