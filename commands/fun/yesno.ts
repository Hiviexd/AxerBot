import { GuildMember, SlashCommandStringOption } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { YesNoReplies } from "../../responses/text/YesNoReplies";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const yesno = new SlashCommand()
    .setName("yesno")
    .setDescription("Yes or no? I can help you decide!")
    .setCategory(CommandCategory.Fun)
    .setHelp({
        syntax: "/yesno `option`",
        example: "/yesno `axer cringe?`",
    })
    .addOptions(
        new SlashCommandStringOption()
            .setName("question")
            .setDescription("Type your question here!")
            .setRequired(true)
    );

yesno.setExecutable(async (command) => {
    const question = command.options.getString("question", true);

    const phrases = YesNoReplies;

    if (!(command.member instanceof GuildMember)) return;

    const res = `> ${question}\n${phrases[Math.floor(Math.random() * phrases.length)]}`;

    command.editReply(res);
});

export { yesno };
