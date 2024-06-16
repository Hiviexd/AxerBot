import { AutocompleteInteraction } from "discord.js";
import { AxerCommands } from "../../commands";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";

export async function helpAutocomplete(command: AutocompleteInteraction) {
    if (command.commandName != "help") return;
    const input = command.options.getString("command", true).replace("/", "").replace(/\s+/g, " ");

    const args = input.split(" ");

    const list: string[] = [];

    if (args.length == 1) {
        AxerCommands.forEach((c) => {
            if (nameIncludesString(args[0], c.allNames)) {
                list.push(`/${c.name}`);

                includeSubcommandsAndGroups(c as SlashCommand);
            }
        });
    }

    if (args.length == 2) {
        const targetCommand = AxerCommands.find((c) =>
            c.allNames.includes(args[0])
        ) as SlashCommand;

        if (targetCommand) {
            targetCommand.subcommands.forEach((c) => {
                if (c.name.includes(args[1])) list.push(`/${targetCommand.name} ${args[1]}`);
            });

            targetCommand.subcommandGroups.forEach((c) => {
                if (c.name.includes(args[1])) {
                    mapGroupCommands(c, targetCommand);
                    list.push(`/${targetCommand.name} ${args[1]}`);
                }
            });
        }
    }

    if (args.length == 3) {
        const targetCommand = AxerCommands.find((c) =>
            c.allNames.includes(args[0])
        ) as SlashCommand;

        if (targetCommand) {
            targetCommand.subcommandGroups.forEach((c) => {
                if (c.name.includes(args[1])) list.push(`/${targetCommand.name} ${args[1]}`);

                filterGroupCommands(c, targetCommand, args[2]);
            });
        }
    }

    function filterGroupCommands(
        group: SlashCommandSubcommandGroup,
        targetCommand: SlashCommand,
        subcommand: string
    ) {
        group.commands.forEach((c) => {
            if (c.name.includes(subcommand))
                list.push(`/${targetCommand.name} ${group.name} ${c.name}`);
        });
    }

    function mapGroupCommands(group: SlashCommandSubcommandGroup, targetCommand: SlashCommand) {
        group.commands.forEach((c) => {
            list.push(`/${targetCommand.name} ${group.name} ${c.name}`);
        });
    }

    function includeSubcommandsAndGroups(command: SlashCommand) {
        command.subcommands.forEach((c) => {
            list.push(`/${command.name} ${c.name}`);
        });

        command.subcommandGroups.forEach((c) => addCommandGroups(c));

        function addCommandGroups(g: SlashCommandSubcommandGroup) {
            list.push(`/${command.name} ${g.name}`);

            g.commands.forEach((c) => list.push(`/${command.name} ${g.name} ${c.name}`));
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
