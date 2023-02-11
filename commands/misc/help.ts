import { Client, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import colors from "./../../constants/colors";
import generateErrorEmbed from "./../../helpers/text/embeds/generateErrorEmbed";
import { AxerCommands } from "commands";
import { SlashCommand } from "../../models/commands/SlashCommand";

export default {
    name: "help",
    category: "misc",
    help: {
        description: "Need help?",
        syntax: "/help <command?> <group?> <subcommand?>",
        example: "/help\n/help `quotes` `set` `enabled`",
    },
    interaction: true,
    config: {
        type: 1,
        options: [
            {
                name: "command_name",
                description: "The first argument after slash",
                type: 3,
            },
            {
                name: "command_group",
                description: "The 2nd argument of the command",
                type: 3,
            },
            {
                name: "subcommand",
                description: "Last argument in the command",
                type: 3,
            },
        ],
    },
    run: async (
        bot: Client,
        interaction: ChatInputCommandInteraction,
        args: []
    ) => {
        await interaction.deferReply();

        const commandName = interaction.options.getString("command_name");
        const commandGroup = interaction.options.getString("command_group");
        const subcommand = interaction.options.getString("subcommand");

        if (!commandName) return sendGlobalHelp();

        async function sendGlobalHelp() {
            const allCommands: any[] = [];

            AxerCommands.forEach((command) => {
                allCommands.push(command);
            });

            const categories: { [key: string]: SlashCommand[] } = {};

            allCommands.forEach((command) => {
                if (!categories[command.category])
                    return (categories[command.category] = [command]);

                categories[command.category].push(command);
            });

            const embed = new EmbedBuilder()
                .setTitle("List of available commands")
                .setDescription(
                    `Use \`/about\` to get more information about the bot.\nUse \`/help\` \`<command>\` to see how a specific command works.`
                )
                .setColor(colors.pink);

            Object.keys(categories).forEach((c) => {
                embed.addFields({
                    name: c,
                    value: categories[c]
                        .map((command) => `\`/${command.names[0]}\``)
                        .join(", "),
                });
            });

            interaction.editReply({ embeds: [embed] });
        }

        const baseCommand = AxerCommands.find((c) =>
            c.names.includes(commandName)
        );

        if (!baseCommand)
            return interaction.editReply({
                embeds: [
                    generateErrorEmbed(
                        "Command not found! Use `/help` to see the list of avaliable commands."
                    ),
                ],
            });

        // ? Generate embed for general
        if (!commandGroup && !subcommand)
            return sendGeneralCommandHelp(baseCommand);

        if (commandName && !commandGroup && subcommand)
            return sendIndividualCommandHelp(baseCommand);

        if (commandName && commandGroup && !subcommand)
            return sendGroupHelp(baseCommand);

        if (commandName && commandGroup && subcommand)
            return sendCommandHelp(baseCommand);

        async function sendIndividualCommandHelp(command: typeof baseCommand) {
            if (!commandName || commandGroup || !subcommand)
                return interaction.editReply({
                    embeds: [
                        generateErrorEmbed(
                            `Command not found! Use \`/help ${commandName} ${subcommand}\` to see the list of avaliable commands of this group.`
                        ),
                    ],
                });

            const commandObject = baseCommand.options.find(
                (c: { name: string }) => c.name == subcommand.toLowerCase()
            );

            if (!commandObject)
                return interaction.editReply({
                    embeds: [
                        generateErrorEmbed(
                            `Command not found! Use \`/help ${commandName} ${subcommand}\` to see the list of avaliable commands of this group.`
                        ),
                    ],
                });

            const embed = new EmbedBuilder()
                .setTitle(`/${command.name} ${subcommand}`)
                .setColor(colors.pink)
                .setDescription(commandObject.description);

            interaction.editReply({ embeds: [embed] });
        }

        async function sendCommandHelp(command: typeof baseCommand) {
            const subcommandObject = command.subcommands.find(
                (c: any) => c.name == subcommand && c.group == commandGroup
            );

            if (
                !subcommand ||
                !commandGroup ||
                !subcommand ||
                !subcommandObject
            )
                return interaction.editReply({
                    embeds: [
                        generateErrorEmbed(
                            `Command not found! Use \`/help ${commandName} ${commandGroup}\` to see the list of avaliable commands of this group.`
                        ),
                    ],
                });

            const embed = new EmbedBuilder()
                .setTitle(
                    `/${command.name} ${subcommandObject.group} ${subcommandObject.name}`
                )
                .setColor(colors.pink)
                .setDescription(subcommandObject.help.description)
                .addFields(generateFields(subcommandObject));

            interaction.editReply({ embeds: [embed] });
        }

        async function sendGroupHelp(command: typeof baseCommand) {
            if (!commandGroup) return;

            const embed = new EmbedBuilder()
                .setTitle(`/${command.name} ${commandGroup}`)
                .setColor(colors.pink)
                .setDescription("Check below all commands in this group:")
                .addFields({
                    name: "Subcommands",
                    value: generateSubcommandsField(
                        command,
                        commandGroup.toLowerCase()
                    ),
                })
                .setFooter({
                    text: `Use /help ${command.name} ${commandGroup} <subcommand> to get info about a command.`,
                });

            interaction.editReply({ embeds: [embed] });
        }

        async function sendGeneralCommandHelp(command: typeof baseCommand) {
            const embed = new EmbedBuilder()
                .setTitle(`/${command.name}`)
                .setColor(colors.pink)
                .setDescription(command.help.description)
                .addFields(generateFields(command));

            if (command.subcommands) {
                embed.addFields({
                    name: "subcommands",
                    value: generateSubcommandsField(command),
                    inline: true,
                });
            }

            interaction.editReply({ embeds: [embed] });
        }

        function generateSubcommandsField(
            command: typeof baseCommand,
            filter?: string
        ) {
            const subcommands = filter
                ? command.subcommands.filter((c: any) => c.group == filter)
                : command.subcommands;

            return subcommands
                .map(
                    (c: any) =>
                        `\`/${command.name}\` \`${c.group}\` \`${c.name}\``
                )
                .join("\n");
        }

        function generateFields(command: typeof baseCommand) {
            const fields: { name: string; value: string; inline?: boolean }[] =
                [];

            const ignoreKeys = ["description"];
            Object.keys(command.help).forEach((k) => {
                if (ignoreKeys.includes(k)) return;
                const commandHelp: { [key: string]: string | string[] } =
                    command.help;

                fields.push({ name: k, value: parseHelpField(commandHelp[k]) });
            });

            function parseHelpField(field: string | string[]) {
                if (typeof field == "object") return field.join(`\n`);

                return field;
            }

            return fields;
        }
    },
};
