import { SlashCommand } from "../../models/commands/SlashCommand";

const choose = new SlashCommand(
    "choose",
    "I will choose for you!",
    "fun",
    false,
    {
        syntax: "/choose `options:Banana or Cookie`",
    }
);

choose.builder.addStringOption((o) =>
    o.setName("options").setDescription('Split using "or"').setRequired(true)
);

choose.setExecuteFunction(async (command) => {
    await command.deferReply();
    const choices = command.options.getString("options", true);
    const choicesString = choices.split(" or ");

    const randomChoice = choices[Math.floor(Math.random() * choices.length)];

    command.editReply(`> ${choicesString}\n${randomChoice}`);
});

export default choose;
