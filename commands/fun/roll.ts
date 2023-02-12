import { GuildMember } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";

const roll = new SlashCommand("roll", "Roll a dice!", "Fun", false, {
    syntax: "/roll `<value>`",
    example: "/roll\n/roll `727`\n/roll `dubs and I ping @everyone`\n",
});

roll.setExecuteFunction(async (command) => {
    await command.deferReply();
    const dice =
        (command.options.getInteger("value")
            ? command.options.getInteger("value")
            : 100) || 100;
    const roll = Math.floor(Math.random() * dice) + 1;
    if (!(command.member instanceof GuildMember)) return;
    command.editReply(
        `**${
            command.member?.nickname
                ? command.member.nickname
                : command.user.username
        }** rolled **${roll}**!`
    );
});

export default roll;
