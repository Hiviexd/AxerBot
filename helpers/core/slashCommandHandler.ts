import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    ContextMenuCommandInteraction,
    GuildMember,
    Interaction,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    UserContextMenuCommandInteraction,
} from "discord.js";

import { AxerCommands } from "../../commands";
import { ContextMenuCommand } from "../../models/commands/ContextMenuCommand";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import generateErrorEmbed from "../text/embeds/generateErrorEmbed";

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
    event:
        | ChatInputCommandInteraction
        | MessageContextMenuCommandInteraction
        | UserContextMenuCommandInteraction
) {
    if (event.user.bot) return;

    const targetCommand = AxerCommands.find(
        (c) =>
            c.names.includes(event.commandName) ||
            (
                c as ContextMenuCommand<
                    | UserContextMenuCommandInteraction
                    | MessageContextMenuCommandInteraction
                >
            ).name == event.commandName
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

    // const jokeChance = new Chance();

    if (targetCommand.isSlashCommand() && event.isChatInputCommand()) {
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
            console.error(e);
            event
                .reply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                })
                .catch(() => void {});

            event
                .editReply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                })
                .catch(() => void {});
        }

        try {
            targetCommand.run(event);
        } catch (e) {
            console.error(e);
            event
                .reply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                })
                .catch(() => void {});

            event
                .editReply({
                    embeds: [generateErrorEmbed("Something went wrong...")],
                })
                .catch(() => void {});
        }
    }

    if (targetCommand.isContextMenu() && event.isContextMenuCommand()) {
        if (event.isContextMenuCommand()) {
            (targetCommand as ContextMenuCommand<any>).run(event);
        }
    }
}
