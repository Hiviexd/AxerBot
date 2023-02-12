import { Client, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";

const coinflip = new SlashCommand(
    "coinflip",
    "Feeling lucky? Flip a coin!",
    "Fun",
    false
);

coinflip.setExecuteFunction(async (command) => {
    await command.deferReply();
    let coin = Math.floor(Math.random() * 2);

    //return nothing if command.member isn't GuildMember
    if (!(command.member instanceof GuildMember)) return;

    command.editReply(
        `**${
            command.member?.nickname
                ? command.member.nickname
                : command.user.username
        }**'s coin landed on **${coin === 0 ? "Heads" : "Tails"}**!`
    );
});

export default coinflip;
