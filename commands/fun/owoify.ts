import { SlashCommandStringOption } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";
const { default: owo } = require("owoify-js");

// TODO: Rewrite owoify-js
const owoify = new SlashCommand()
    .setName("owoify")
    .setNameAliases(["owotext"])
    .setDescription("I'm not sorry")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true)
    .addOptions(
        new SlashCommandStringOption()
            .setName("text")
            .setDescription(owo("Type your text"))
            .setRequired(true)
    );

owoify.setExecutable(async (command) => {
    const text = command.options.getString("text", true);

    command.editReply(owo(text));
});

export { owoify };
