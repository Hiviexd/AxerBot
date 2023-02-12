import {
    ChatInputCommandInteraction,
    Client,
    GuildMember,
    PermissionFlagsBits,
    PermissionResolvable,
} from "discord.js";

import { AxerCommands } from "../../commands";

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
    if (event.user.bot || !event.channel || !event.guild) return;

    const targetCommand = AxerCommands.find((c) =>
        c.names.includes(event.commandName)
    );

    if (!targetCommand) return console.log("0"); // Command not found error embed

    if (!targetCommand.allowDM && event.channel.isDMBased())
        return console.log("1"); // Command error message

    if (targetCommand.permissions && !event.member) return console.log("2"); // This command can't be executed here!

    if (
        !checkMemberPermissions(
            event.member as GuildMember,
            targetCommand.permissions
        )
    ) {
        return;
    }

    try {
        if (event.options.getSubcommand())
            return targetCommand.runSubcommand(event, {
                name: event.options.getSubcommand(),
                group: event.options.getSubcommandGroup(),
            });
    } catch (e) {
        void {};
    }

    targetCommand.run(event);
}
