import { Client, Message, MessageEmbed } from "discord.js";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";
import * as database from "./../../database";

export default {
    name: "logging",
    description: "Configure the logging system",
    syntax: "!logging `<action>` `<value>`",
    example: "!logging `channel` `wasteland`\n!logging `disable`",
    subcommands: [],
    category: "management",
    options: ["`channel`", "`disable`"],
    run: async (bot: Client, message: Message, args: string[]) => {
        const actions = ["disable", "channel"];

        if (!message.guild) return;

        if (!message.member?.permissions.has("MANAGE_CHANNELS", true))
            return message.channel.send({ embeds: [MissingPermissions] });

        const guild = await database.guilds.findOne({ _id: message.guildId });

        if (args.length == 0) return sendCurrentConfiguration();

        if (args.length == 2) {
            const params = {
                action: args[0],
                value: args[1],
            };

            if (!actions.includes(params.action))
                return message.channel.send(
                    "❗ Invalid action. Provide a valid action."
                );


            if (params.action == "channel") {
                if (params.value == "") {
                    return message.channel.send(
                        "❗ Provide a channel name"
                    );
                }
                    const channel = message.guild?.channels.cache.find(
                        (channel) =>
                            channel.name.toLowerCase() == params.value &&
                            channel.type == "GUILD_TEXT"
                    );

                    if (!channel)
                        return message.channel.send(
                            `❗ No channel found with name ${params.value.toLowerCase()}.`
                        );

                    guild.logging.channel = channel.id;
                    guild.logging.enabled = true;

                await database.guilds.updateOne(
                    { _id: message.guildId },
                    { $set: { logging: guild.logging } }
                );

                return message.channel.send(
                    `✅ Logging channel set to <#${guild.logging.channel}>.`
                );
            }
        }

        if (args.length == 1) {
            const params = {
                action: args[0],
            };

            if (!actions.includes(params.action))
                return message.channel.send(
                    "❗ Invalid action. Provide a valid action."
                );

            if(params.action == "disable") {
                guild.logging.enabled = false;

                await database.guilds.updateOne(
                    { _id: message.guildId },
                    { $set: { logging: guild.logging } }
                );

                return message.channel.send(
                    `✅ Logging disabled.`
                );
            }
                
        }
        function sendCurrentConfiguration() {
            const embed = new MessageEmbed()
                .setTitle("Logging Configuration")
                .setColor(guild.logging.enabled ? "#1df27d" : "#e5243b")
                .setDescription(
                    `**Status:** ${guild.logging.enabled ? "Enabled" : "Disabled"}
                    **Channel:** <#${guild.logging.channel}>`
                );

            message.channel.send({ embeds: [embed] });
        }
    }
};