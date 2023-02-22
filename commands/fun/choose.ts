import { SlashCommand } from "../../models/commands/SlashCommand";

const choose = new SlashCommand(
    "choose",
    "I will choose for you!",
    "Fun",
    true,
    {
        syntax: "/choose `options:banana or cookies`",
    }
);

choose.builder.addStringOption((o) =>
    o.setName("options").setDescription('Split using "or"').setRequired(true)
);

choose.setExecuteFunction(async (command) => {
    const choicesString = command.options.getString("options", true);

    const choices = choicesString.split(" or ");

    const randomChoice = choices[Math.floor(Math.random() * choices.length)];

    command.editReply(`> ${choicesString}\n${randomChoice}`);
});

export default choose;
