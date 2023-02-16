import { Client } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
const { default: owo } = require("owoify-js");

const owoify = new SlashCommand(
    ["owoify", "owotext"],
    "Turn your text into owo text!\n I'm not sorry.",
    "Fun",
    true
);

owoify.builder.addStringOption((o) =>
    o.setName("text").setDescription(owo("Type your text"))
);

owoify.setExecuteFunction(async (command) => {
    const text = command.options.getString("text", true);

    command.editReply(owo(text));
});

export default owoify;
