import { AutocompleteInteraction } from "discord.js";
import { AxerCommands } from "../../commands";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";

export async function helpAutocomplete(command: AutocompleteInteraction) {
    if (command.commandName != "help") return;

    const input = command.options
        .getString("command", true)
        .replace("/", "")
        .replace(/\s+/g, " ");

    const args = input.split(" ");

    const list: string[] = [];

    if (args.length == 1) {
        AxerCommands.forEach((c) => {
            if (nameIncludesString(args[0], c.names)) {
                list.push(`/${c.names[0]}`);

                includeSubcommandsAndGroups(c);
            }
        });
    }

    if (args.length == 2) {
        const targetCommand = AxerCommands.find((c) =>
            c.names.includes(args[0])
        );

        if (targetCommand) {
            targetCommand.subcommands.forEach((c) => {
                if (c.builder.name.includes(args[1]))
                    list.push(`/${targetCommand.names[0]} ${args[1]}`);
            });

            targetCommand.subcommandGroups.forEach((c) => {
                if (c.builder.name.includes(args[1])) {
                    mapGroupCommands(c, targetCommand);
                    list.push(`/${targetCommand.names[0]} ${args[1]}`);
                }
            });
        }
    }

    if (args.length == 3) {
        const targetCommand = AxerCommands.find((c) =>
            c.names.includes(args[0])
        );

        if (targetCommand) {
            targetCommand.subcommandGroups.forEach((c) => {
                if (c.builder.name.includes(args[1]))
                    list.push(`/${targetCommand.names[0]} ${args[1]}`);

                filterGroupCommands(c, targetCommand, args[2]);
            });
        }
    }

    function filterGroupCommands(
        group: SlashCommandSubcommandGroup,
        targetCommand: SlashCommand,
        subcommand: string
    ) {
        group.subcommands.forEach((c) => {
            if (c.builder.name.includes(subcommand))
                list.push(
                    `/${targetCommand.names[0]} ${group.builder.name} ${c.builder.name}`
                );
        });
    }

    function mapGroupCommands(
        group: SlashCommandSubcommandGroup,
        targetCommand: SlashCommand
    ) {
        group.subcommands.forEach((c) => {
            list.push(
                `/${targetCommand.names[0]} ${group.builder.name} ${c.builder.name}`
            );
        });
    }

    function includeSubcommandsAndGroups(command: SlashCommand) {
        command.subcommands.forEach((c) => {
            list.push(`/${command.names[0]} ${c.builder.name}`);
        });

        command.subcommandGroups.forEach((c) => addCommandGroups(c));

        function addCommandGroups(g: SlashCommandSubcommandGroup) {
            list.push(`/${command.names[0]} ${g.builder.name}`);

            g.subcommands.forEach((c) =>
                list.push(
                    `/${command.names[0]} ${g.builder.name} ${c.builder.name}`
                )
            );
        }
    }

    function nameIncludesString(value: string, names: string[]) {
        let includes = false;

        names.forEach((n) => {
            if (n.includes(value)) includes = true;
        });

        return includes;
    }

    list.splice(24, 9999);

    return command.respond(
        list.map((command) => {
            return {
                name: `${command}`,
                value: command,
            };
        })
    );
}
