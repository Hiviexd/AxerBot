import { GuildMember, SlashCommandIntegerOption } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const roll = new SlashCommand()
    .setName("roll")
    .setDescription("Roll a number!")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true)
    .addOptions(
        new SlashCommandIntegerOption()
            .setName("value")
            .setDescription("The maximum value of the roll")
    );

roll.setExecutable(async (command) => {
    const dice =
        (command.options.getInteger("value") ? command.options.getInteger("value") : 100) || 100;
    const roll = Math.floor(Math.random() * dice) + 1;
    if (!(command.member instanceof GuildMember)) return;
    command.editReply(
        `**${
            command.member?.nickname ? command.member.nickname : command.user.username
        }** rolled **${roll}** ${roll == 1 ? "point" : "points"}!`
    );
});

export { roll };
