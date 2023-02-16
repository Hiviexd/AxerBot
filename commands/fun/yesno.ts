import {
    Client,
    Message,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { parseTextFile } from "../../helpers/text/processText";
import { SlashCommand } from "../../models/commands/SlashCommand";

const yesno = new SlashCommand(
    "yesno",
    "Yes or no? I can help you decide!",
    "Fun",
    true,
    {
        description: "Yes or no? I can help you decide!",
        syntax: "/yesno `option`",
        example: "/yesno `axer cringe?`",
    }
);

yesno.builder.addStringOption((o) =>
    o.setName("question").setDescription("Type your question here!")
);

yesno.setExecuteFunction(async (command) => {
    //get question from options
    const question = command.options.getString("question");

    const phrases = await parseTextFile(
        __dirname.concat("/../../responses/text/yesno.txt")
    );

    if (!(command.member instanceof GuildMember)) return;

    const res = `> ${question}\n${
        phrases[Math.floor(Math.random() * phrases.length)]
    }`;

    command.editReply(res);
});

export default yesno;
