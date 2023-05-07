import { GuildMember } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";

const roll = new SlashCommand("roll", "roll a number!", "Fun", true, {
    syntax: "/roll `<value>`",
});

roll.builder.addIntegerOption((o) =>
    o.setName("value").setDescription("The maximum value of the roll")
);

roll.setExecuteFunction(async (command) => {
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
        }** rolled **${roll}** ${roll == 1 ? "point" : "points"}!`
    );
});

export default roll;
