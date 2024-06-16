import { SlashCommandStringOption } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const choose = new SlashCommand()
    .setName("choose")
    .setDescription("I will choose for you!")
    .setCategory(CommandCategory.Fun)
    .setHelp({
        syntax: "/choose `options:banana or cookies`",
    })
    .setDMPermission(true)
    .addOptions(
        new SlashCommandStringOption()
            .setName("options")
            .setDescription('Split using "or"')
            .setRequired(true)
    );

choose.setExecutable(async (command) => {
    const choicesString = command.options.getString("options", true);

    const choices = choicesString.split(" or ");

    if (choices.length < 2)
        return command.editReply(
            'You should split your text using "or". Example: "banana or cookies"'
        );

    const randomChoice = choices[Math.floor(Math.random() * choices.length)];

    command.editReply(`> ${choicesString}\n${randomChoice}`);
});

export { choose };
