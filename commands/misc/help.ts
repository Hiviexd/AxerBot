import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import getEmoji from "../../helpers/text/getEmoji";
import colors from "../../constants/colors";
import { AxerCommands } from "..";
import CommandNotFound from "../../responses/embeds/CommandNotFound";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { SlashCommandSubcommand } from "../../models/commands/SlashCommandSubcommand";

const help = new SlashCommand(
    ["help", "commands"],
    "Need help?",
    "Miscellaneous",
    true,
    {
        syntax: "/help command:<command>",
        example: "/help command:`/verification set channel`",
    }
);

help.builder.addStringOption((o) =>
    o
        .setName("command")
        .setDescription("Example: /verification set channel")
        .setAutocomplete(true)
);

help.setExecuteFunction(async (command) => {
    const input = command.options.getString("command");

    if (!input) return sendGeneralHelp();

    if (input) {
        const args = input.replace("/", "").replace(/\s+/g, " ").split(" ");

        if (args.length == 1) return sendBaseCommandHelp(args[0]);

        if (args.length == 2)
            return sendGroupOrSubcommandHelp(args[0], args[1]);

        if (args.length == 3)
            return sendSubcommandWithGroup(args[0], args[1], args[2]);
    }

    function sendSubcommandWithGroup(
        commandName: string,
        group: string,
        subcommand: string
    ) {
        const targetCommand = AxerCommands.find((c) =>
            c.names.includes(commandName)
        );

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const targetGroup = targetCommand.subcommandGroups.find(
            (c) => c.builder.name == group
        );

        if (!targetGroup)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const targetSubcommand = targetGroup.subcommands.find(
            (c) => c.builder.name == subcommand
        );

        if (!targetSubcommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("infopink")} | /${commandName} ${subcommand}`)
            .setColor(colors.pink)
            .setDescription(targetSubcommand.builder.description);

        mapEmbedFields(embed, targetSubcommand);

        return command.editReply({
            embeds: [embed],
        });
    }

    function sendGroupOrSubcommandHelp(
        commandName: string,
        subcommand: string
    ) {
        const targetCommand = AxerCommands.find((c) =>
            c.names.includes(commandName)
        );

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        if (targetCommand.subcommands.find((c) => c.builder.name == subcommand))
            return sendSubcommand();

        if (
            targetCommand.subcommandGroups.find(
                (c) => c.builder.name == subcommand
            )
        )
            return sendGroup();

        function sendGroup() {
            const targetGroup = targetCommand?.subcommandGroups.find(
                (c) => c.builder.name == subcommand
            );

            if (!targetCommand || !targetGroup) return;

            const embed = new EmbedBuilder()
                .setTitle(
                    `${getEmoji("infopink")} | /${commandName} ${subcommand}`
                )
                .setColor(colors.pink)
                .setDescription("All commands of this command group:");

            let subcommands = "";
            targetGroup.subcommands.forEach((command) => {
                subcommands = subcommands.concat(
                    `${getEmoji("small_dot")} **/${
                        targetCommand.names[0]
                    }** \`${command.builder.name}\`\n`
                );
            });

            embed.addFields({
                name: `${getEmoji("dot")} Subcommands`,
                value: subcommands,
            });

            return command.editReply({
                embeds: [embed],
            });
        }

        function sendSubcommand() {
            const targetSubcommand = targetCommand?.subcommands.find(
                (c) => c.builder.name == subcommand
            );

            if (!targetCommand || !targetSubcommand) return;

            const embed = new EmbedBuilder()
                .setTitle(
                    `${getEmoji("infopink")} | /${commandName} ${subcommand}`
                )
                .setColor(colors.pink)
                .setDescription(targetSubcommand.builder.description);

            mapEmbedFields(embed, targetSubcommand);

            return command.editReply({
                embeds: [embed],
            });
        }
    }

    function mapEmbedFields(
        embed: EmbedBuilder,
        command: SlashCommand | SlashCommandSubcommand
    ) {
        Object.keys(command.help).forEach((key: string) => {
            if (key == "description") return;

            if (typeof command.help[key] == "string") {
                embed.addFields({
                    name: key,
                    value: command.help[key] as string,
                });
            } else {
                embed.addFields({
                    name: key,
                    value: (command.help[key] as string[]).join("\n"),
                });
            }
        });
    }

    function sendBaseCommandHelp(commandName: string) {
        const targetCommand = AxerCommands.find((c) =>
            c.names.includes(commandName)
        );

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("infopink")} | /${commandName}`)
            .setColor(colors.pink)
            .setDescription(targetCommand.builder.description);

        let subcommands = "";
        targetCommand.subcommands.forEach((command) => {
            subcommands = subcommands.concat(
                `${getEmoji("small_dot")} **/${targetCommand.names[0]}** \`${
                    command.builder.name
                }\`\n`
            );
        });

        targetCommand.subcommandGroups.forEach((group) => {
            mapGroupCommands(group);
        });

        function mapGroupCommands(group: SlashCommandSubcommandGroup) {
            group.subcommands.forEach((command) => {
                subcommands = subcommands.concat(
                    `${getEmoji("small_dot")} **/${
                        targetCommand?.names[0]
                    }** \`${group.builder.name}\` \`${command.builder.name}\`\n`
                );
            });
        }

        mapEmbedFields(embed, targetCommand);

        if (subcommands.trim() != "") {
            embed.addFields({
                name: `${getEmoji("dot")} Subcommands`,
                value: subcommands,
            });
        }

        return command.editReply({
            embeds: [embed],
        });
    }

    function sendGeneralHelp() {
        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("infopink")} List of available commands`)
            .setColor(colors.pink)
            .setDescription(
                "Use `/about` to get more information about the bot.\n`/help <command>` to see how a specific command works."
            )
            .setThumbnail(command.client.user.avatarURL());

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("GitHub")
                .setURL(
                    process.env.GITHUB_URL ||
                        "https://github.com/axer-bot/axerbot"
                ),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Support Server")
                .setURL(
                    process.env.SUPPORT_SERVER ||
                        "https://discord.gg/h93K87WbrN"
                )
        );

        const categories: { [key: string]: SlashCommand[] } = {};

        // Generate command categories list
        AxerCommands.forEach((command) => {
            if (!categories[command.category]) {
                return (categories[command.category] = [command]);
            } else {
                return categories[command.category].push(command);
            }
        });

        Object.keys(categories).forEach((category) => {
            embed.addFields({
                name: `${getEmoji("dot")} ${category}`,
                value: categories[category]
                    .map((c) => `\`/${c.names[0]}\``)
                    .join(", "),
            });
        });

        return command.editReply({
            embeds: [embed],
            components: [buttonsRow],
        });
    }
});

export default help;

// import { Client, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
// import colors from "./../../constants/colors";
// import generateErrorEmbed from "./../../helpers/text/embeds/generateErrorEmbed";
// import { AxerCommands } from "commands";
// import { SlashCommand } from "../../models/commands/SlashCommand";

// export default {
//     name: "help",
//     category: "Miscellaneous",
//     help: {
//         description: "Need help?",
//         syntax: "/help <command?> <group?> <subcommand?>",
//         example: "/help\n/help `quotes` `set` `enabled`",
//     },
//     interaction: true,
//     config: {
//         type: 1,
//         options: [
//             {
//                 name: "command_name",
//                 description: "The first argument after slash",
//                 type: 3,
//             },
//             {
//                 name: "command_group",
//                 description: "The 2nd argument of the command",
//                 type: 3,
//             },
//             {
//                 name: "subcommand",
//                 description: "Last argument in the command",
//                 type: 3,
//             },
//         ],
//     },
//     run: async (
//         bot: Client,
//         interaction: ChatInputCommandInteraction,
//         args: []
//     ) => {
//         await interaction.deferReply();

//         const commandName = interaction.options.getString("command_name");
//         const commandGroup = interaction.options.getString("command_group");
//         const subcommand = interaction.options.getString("subcommand");

//         if (!commandName) return sendGlobalHelp();

//         async function sendGlobalHelp() {
//             const allCommands: any[] = [];

//             AxerCommands.forEach((command) => {
//                 allCommands.push(command);
//             });

//             const categories: { [key: string]: SlashCommand[] } = {};

//             allCommands.forEach((command) => {
//                 if (!categories[command.category])
//                     return (categories[command.category] = [command]);

//                 categories[command.category].push(command);
//             });

//             const embed = new EmbedBuilder()
//                 .setTitle("List of available commands")
//                 .setDescription(
//                     `Use \`/about\` to get more information about the bot.\nUse \`/help\` \`<command>\` to see how a specific command works.`
//                 )
//                 .setColor(colors.pink);

//             Object.keys(categories).forEach((c) => {
//                 embed.addFields({
//                     name: c,
//                     value: categories[c]
//                         .map((command) => `\`/${command.names[0]}\``)
//                         .join(", "),
//                 });
//             });

//             interaction.editReply({ embeds: [embed] });
//         }

//         const baseCommand = AxerCommands.find((c) =>
//             c.names.includes(commandName)
//         );

//         if (!baseCommand)
//             return interaction.editReply({
//                 embeds: [
//                     generateErrorEmbed(
//                         "Command not found! Use `/help` to see the list of avaliable commands."
//                     ),
//                 ],
//             });

//         // ? Generate embed for general
//         if (!commandGroup && !subcommand)
//             return sendGeneralCommandHelp(baseCommand);

//         if (commandName && !commandGroup && subcommand)
//             return sendIndividualCommandHelp(baseCommand);

//         if (commandName && commandGroup && !subcommand)
//             return sendGroupHelp(baseCommand);

//         if (commandName && commandGroup && subcommand)
//             return sendCommandHelp(baseCommand);

//         async function sendIndividualCommandHelp(command: typeof baseCommand) {
//             if (!commandName || commandGroup || !subcommand)
//                 return interaction.editReply({
//                     embeds: [
//                         generateErrorEmbed(
//                             `Command not found! Use \`/help ${commandName} ${subcommand}\` to see the list of avaliable commands of this group.`
//                         ),
//                     ],
//                 });

//             const commandObject = baseCommand.options.find(
//                 (c: { name: string }) => c.name == subcommand.toLowerCase()
//             );

//             if (!commandObject)
//                 return interaction.editReply({
//                     embeds: [
//                         generateErrorEmbed(
//                             `Command not found! Use \`/help ${commandName} ${subcommand}\` to see the list of avaliable commands of this group.`
//                         ),
//                     ],
//                 });

//             const embed = new EmbedBuilder()
//                 .setTitle(`/${command.name} ${subcommand}`)
//                 .setColor(colors.pink)
//                 .setDescription(commandObject.description);

//             interaction.editReply({ embeds: [embed] });
//         }

//         async function sendCommandHelp(command: typeof baseCommand) {
//             const subcommandObject = command.subcommands.find(
//                 (c: any) => c.name == subcommand && c.group == commandGroup
//             );

//             if (
//                 !subcommand ||
//                 !commandGroup ||
//                 !subcommand ||
//                 !subcommandObject
//             )
//                 return interaction.editReply({
//                     embeds: [
//                         generateErrorEmbed(
//                             `Command not found! Use \`/help ${commandName} ${commandGroup}\` to see the list of avaliable commands of this group.`
//                         ),
//                     ],
//                 });

//             const embed = new EmbedBuilder()
//                 .setTitle(
//                     `/${command.name} ${subcommandObject.group} ${subcommandObject.name}`
//                 )
//                 .setColor(colors.pink)
//                 .setDescription(subcommandObject.help.description)
//                 .addFields(generateFields(subcommandObject));

//             interaction.editReply({ embeds: [embed] });
//         }

//         async function sendGroupHelp(command: typeof baseCommand) {
//             if (!commandGroup) return;

//             const embed = new EmbedBuilder()
//                 .setTitle(`/${command.name} ${commandGroup}`)
//                 .setColor(colors.pink)
//                 .setDescription("Check below all commands in this group:")
//                 .addFields({
//                     name: "Subcommands",
//                     value: generateSubcommandsField(
//                         command,
//                         commandGroup.toLowerCase()
//                     ),
//                 })
//                 .setFooter({
//                     text: `Use /help ${command.name} ${commandGroup} <subcommand> to get info about a command.`,
//                 });

//             interaction.editReply({ embeds: [embed] });
//         }

//         async function sendGeneralCommandHelp(command: typeof baseCommand) {
//             const embed = new EmbedBuilder()
//                 .setTitle(`/${command.name}`)
//                 .setColor(colors.pink)
//                 .setDescription(command.help.description)
//                 .addFields(generateFields(command));

//             if (command.subcommands) {
//                 embed.addFields({
//                     name: "subcommands",
//                     value: generateSubcommandsField(command),
//                     inline: true,
//                 });
//             }

//             interaction.editReply({ embeds: [embed] });
//         }

//         function generateSubcommandsField(
//             command: typeof baseCommand,
//             filter?: string
//         ) {
//             const subcommands = filter
//                 ? command.subcommands.filter((c: any) => c.group == filter)
//                 : command.subcommands;

//             return subcommands
//                 .map(
//                     (c: any) =>
//                         `\`/${command.name}\` \`${c.group}\` \`${c.name}\``
//                 )
//                 .join("\n");
//         }

//         function generateFields(command: typeof baseCommand) {
//             const fields: { name: string; value: string; inline?: boolean }[] =
//                 [];

//             const ignoreKeys = ["description"];
//             Object.keys(command.help).forEach((k) => {
//                 if (ignoreKeys.includes(k)) return;
//                 const commandHelp: { [key: string]: string | string[] } =
//                     command.help;

//                 fields.push({ name: k, value: parseHelpField(commandHelp[k]) });
//             });

//             function parseHelpField(field: string | string[]) {
//                 if (typeof field == "object") return field.join(`\n`);

//                 return field;
//             }

//             return fields;
//         }
//     },
// };
