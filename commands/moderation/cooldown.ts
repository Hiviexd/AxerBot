import { Client, Message } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions"
import { ownerId } from "../../config.json";
import { readdirSync } from "fs";
import path from "path";
import * as database from "./../../database";

export default {
	name: "purge",
	description: "Deletes x amount of messages from a channel",
	syntax: "!cooldown `<channels>` `<categories>` `<cooldown>` `<increments>`",
	example: "!purge `6`",
	category: "moderation",
    run:  async(bot: Client, message: Message, args: string[]) => {
        const categories = readdirSync(path.resolve(__dirname.concat("/../")), "utf8") // Get categories

        // !cooldown <channels> <categories> <cooldown> <increments>

        if (!message.guild) return;

        const guild = await database.guilds.findById(message.guildId)

        if (args.length == 4) {
            const _config:any = {
                channels: args[0],
                scope: args[1],
                cooldown: args[2],
                increments: args[3] || 0,
                active: false
            }

            const config:any = {
                channels: [],
                scope: [],
                cooldown: Number(args[2]),
                increments: Number(args[3]) || 0,
                ends_at: 0,
                active: false
            }

            _config.channels.split(",").forEach((c:any) => {
                if (!message.guild) return;

                const channel = message.guild.channels.cache.find(ch => ch.name.toLowerCase() == c.toLowerCase())

                if (!channel) return;

                config.channels.push({
                    id: channel.id,
                    name: channel.name
                })
            })

            _config.scope.split(",").forEach((c:any) => {
                if (!message.guild) return;

                if (categories.includes(c.toLowerCase())) {
                    config.scope.push(c)
                }
            })

            const configIndex = guild.cooldown.findIndex((c: any) => {c.scope == config.scope})
            const newConfig = config;
            guild.cooldown[configIndex] = newConfig;

            await database.guilds.updateOne({ _id: guild._id }, {
                cooldown: guild.cooldown
            })

            console.log(config)
            message.channel.send("its working, i think")
            
        } else {
            return message.channel.send("Fuck dumbass")
        }
    }
}