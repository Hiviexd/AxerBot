import { numberToEmoji } from "../../helpers/text/numberToEmoji";
import * as database from "./../../database";
import { SlashCommand } from "../../models/commands/SlashCommand";

const revolver = new SlashCommand(
    "revolver",
    "Russian Roulette, but with bigger numbers!",
    "fun",
    false
);

revolver.setExecuteFunction(async (command) => {
    await command.deferReply();

    const guild = await database.guilds.findOne({ _id: command.guildId });
    if (!guild) return;

    let revolver = Math.floor(Math.random() * 6) + 1;

    if (revolver === 1) {
        guild.fun.revolver = 0;
        await database.guilds.findByIdAndUpdate(command.guildId, {
            fun: guild.fun,
        });
        command.editReply(`💥 🔫`);
    } else {
        guild.fun.revolver++;
        await database.guilds.findByIdAndUpdate(command.guildId, {
            fun: guild.fun,
        });
        command.editReply(`${numberToEmoji(guild.fun.revolver)} 🔫`);
    }
});

export default revolver;
