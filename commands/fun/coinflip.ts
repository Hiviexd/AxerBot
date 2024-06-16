import { GuildMember } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const coinflip = new SlashCommand()
    .setName("coinflip")
    .setDescription("Feeling lucky? Flip a coin!")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true);

coinflip.setExecutable(async (command) => {
    let coin = Math.floor(Math.random() * 2);

    //return nothing if command.member isn't GuildMember
    if (!(command.member instanceof GuildMember)) return;

    command.editReply(
        `**${
            command.member?.nickname ? command.member.nickname : command.user.username
        }**'s coin landed on **${coin === 0 ? "Heads" : "Tails"}**!`
    );
});

export { coinflip };
