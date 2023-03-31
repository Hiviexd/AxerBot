import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    GuildMember,
    PermissionFlagsBits,
    PermissionResolvable,
} from "discord.js";

import { AxerCommands } from "../../commands";
import generateErrorEmbed from "../text/embeds/generateErrorEmbed";
import MissingPermissions from "../../responses/embeds/MissingPermissions";

import { Chance } from "chance";

export function checkMemberPermissions(
    member: GuildMember,
    permissions: PermissionResolvable[]
) {
    let pass = false;

    if (!member) return false;

    if (permissions.length == 0) return true;

    permissions.forEach((permission) => {
        if (member.permissions.has(permission)) pass = true;
    });

    return pass;
}

export default async function commandHandler(
    bot: Client,
    event: ChatInputCommandInteraction
) {
    if (event.user.bot) return;

    const targetCommand = AxerCommands.find((c) =>
        c.names.includes(event.commandName)
    );

    if (!targetCommand) return console.log("0"); // Command not found error embed

    if (!targetCommand.allowDM && !event.channel)
        return event.reply({
            embeds: [
                generateErrorEmbed("You need to run this command in a guild!"),
            ],
        }); // Command error message

    if (!targetCommand.allowDM && event.channel?.type == ChannelType.DM)
        return event.reply({
            embeds: [
                generateErrorEmbed("You need to run this command in a guild!"),
            ],
        }); // Command error message

    if (targetCommand.permissions.length != 0 && !event.member)
        return event.reply({
            embeds: [
                generateErrorEmbed("You need to run this command in a guild!"),
            ],
        });

    if (
        targetCommand.permissions.length != 0 &&
        !checkMemberPermissions(
            event.member as GuildMember,
            targetCommand.permissions
        )
    ) {
        return event.reply({
            embeds: [MissingPermissions],
        });
    }

    const jokeChance = new Chance();

    if (jokeChance.bool({ likelihood: 50 })) {
        return event.reply('Say "please master" <:trol:1091493021243150416>');
    } else {
        try {
            if (
                event.options.getSubcommand() ||
                event.options.getSubcommandGroup()
            )
                return targetCommand.runSubcommand(event, {
                    name: event.options.getSubcommand(),
                    group: event.options.getSubcommandGroup(),
                });
        } catch (e) {
            void {};
        }

        targetCommand.run(event);
    }
}
