import {Message} from "discord.js";
import * as database from "./../../../database"
import createNewGuild from "../../../database/utils/createNewGuild";
import { parseTextFileAttachment } from "../../../utils/messages/processText";

export async function quotesSetList(message: Message) {
    let guild = await database.guilds.findById(message.guildId)
    const file = message.attachments.first();

    if (!message.guild) return;

    if (!file || file.contentType != "text/plain; charset=utf-8") return message.channel.send("❗ Provide a valid text file");

    // ? Prevent big files (It uses bytes)
    if (file.size > 200000) return message.channel.send("❗ File too big. (Max 200kb)");

    if (guild == null) guild = await createNewGuild(message.guild);

    const list = await parseTextFileAttachment(file.url);

    guild.fun.enable = true;
    guild.fun.phrases = list;

    await database.guilds.findOneAndUpdate({ _id: message.guildId }, {
        fun: guild.fun
    })
    
    message.channel.send("✅ Loaded list")
}