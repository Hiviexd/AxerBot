import { GuildMember } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { YesNoReplies } from "../../responses/text/YesNoReplies";

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

    const phrases = YesNoReplies;

    if (!(command.member instanceof GuildMember)) return;

    const res = `> ${question}\n${
        phrases[Math.floor(Math.random() * phrases.length)]
    }`;

    command.editReply(res);
});

export default yesno;
