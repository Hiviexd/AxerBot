import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandStringOption,
} from "discord.js";
import { SlashCommand } from "../../models/commands/SlashCommand";
import getEmoji from "../../helpers/text/getEmoji";
import colors from "../../constants/colors";
import { AxerCommands } from "..";
import CommandNotFound from "../../responses/embeds/CommandNotFound";
import { SlashCommandSubcommandGroup } from "../../models/commands/SlashCommandSubcommandGroup";
import { SlashCommandSubcommand } from "../../models/commands/SlashCommandSubcommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const help = new SlashCommand()
    .setName("help")
    .setNameAliases(["commands"])
    .setCategory(CommandCategory.General)
    .setDescription("Do you need help?")
    .setHelp({
        syntax: "/help command:<command>",
        example: "/help command:`/verification set channel`",
    })
    .addOptions(
        new SlashCommandStringOption()
            .setName("command")
            .setDescription("Example: /verification set channel")
            .setAutocomplete(true)
    );

help.setExecutable(async (command) => {
    const input = command.options.getString("command");

    if (!input) return sendGeneralHelp();

    if (input) {
        const args = input.replace("/", "").replace(/\s+/g, " ").split(" ");

        if (args.length == 1) return sendBaseCommandHelp(args[0]);

        if (args.length == 2) return sendGroupOrSubcommandHelp(args[0], args[1]);

        if (args.length == 3) return sendSubcommandWithGroup(args[0], args[1], args[2]);
    }

    function sendSubcommandWithGroup(commandName: string, group: string, subcommand: string) {
        const targetCommand = AxerCommands.find((c) =>
            c.allNames.includes(commandName)
        ) as SlashCommand;

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const targetGroup = targetCommand.getGroup(group);

        if (!targetGroup)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const targetSubcommand = targetGroup.getCommand(subcommand);

        if (!targetSubcommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("infopink")} | /${commandName} ${subcommand}`)
            .setColor(colors.pink)
            .setDescription(targetSubcommand.description);

        mapEmbedFields(embed, targetSubcommand);

        return command.editReply({
            embeds: [embed],
        });
    }

    function sendGroupOrSubcommandHelp(commandName: string, subcommand: string) {
        const targetCommand = AxerCommands.find((c) =>
            c.allNames.includes(commandName)
        ) as SlashCommand;

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        if (targetCommand.getSubcommand(subcommand)) return sendSubcommand();

        if (targetCommand.getGroup(subcommand)) return sendGroup();

        function sendGroup() {
            const targetGroup = targetCommand?.getGroup(subcommand);

            if (!targetCommand || !targetGroup) return;

            const embed = new EmbedBuilder()
                .setTitle(`${getEmoji("infopink")} | /${commandName} ${subcommand}`)
                .setColor(colors.pink)
                .setDescription("All commands of this command group:");

            let subcommands = "";

            targetGroup.commands.forEach((command) => {
                subcommands = subcommands.concat(
                    `${getEmoji("small_dot")} **/${targetCommand.name}** \`${command.name}\`\n`
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
            const targetSubcommand = targetCommand?.getSubcommand(subcommand);

            if (!targetCommand || !targetSubcommand) return;

            const embed = new EmbedBuilder()
                .setTitle(`${getEmoji("infopink")} | /${commandName} ${subcommand}`)
                .setColor(colors.pink)
                .setDescription(targetSubcommand.description);

            mapEmbedFields(embed, targetSubcommand);

            return command.editReply({
                embeds: [embed],
            });
        }
    }

    function mapEmbedFields(embed: EmbedBuilder, command: SlashCommand | SlashCommandSubcommand) {
        Object.keys(command.helpFields).forEach((key: string) => {
            if (key == "description") return;

            if (typeof command.helpFields[key] == "string") {
                embed.addFields({
                    name: key,
                    value: command.helpFields[key] as string,
                });
            } else {
                embed.addFields({
                    name: key,
                    value: (command.helpFields[key] as string[]).join("\n"),
                });
            }
        });
    }

    function sendBaseCommandHelp(commandName: string) {
        const targetCommand = AxerCommands.find((c) =>
            c.allNames.includes(commandName)
        ) as SlashCommand;

        if (!targetCommand)
            return command.editReply({
                embeds: [CommandNotFound],
            });

        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("infopink")} | /${commandName}`)
            .setColor(colors.pink)
            .setDescription(targetCommand.description);

        let subcommands = "";
        targetCommand.subcommands.forEach((command) => {
            subcommands = subcommands.concat(
                `${getEmoji("small_dot")} **/${targetCommand.name}** \`${command.name}\`\n`
            );
        });

        targetCommand.subcommandGroups.forEach((group) => {
            mapGroupCommands(group);
        });

        function mapGroupCommands(group: SlashCommandSubcommandGroup) {
            group.commands.forEach((command) => {
                subcommands = subcommands.concat(
                    `${getEmoji("small_dot")} **/${targetCommand?.name}** \`${group.name}\` \`${
                        command.name
                    }\`\n`
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
                .setURL(process.env.GITHUB_URL || "https://github.com/axer-bot/axerbot"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Support Server")
                .setURL(process.env.SUPPORT_SERVER || "https://discord.gg/h93K87WbrN")
        );

        const categories: { [key: string]: SlashCommand[] } = {};

        // Generate command categories list
        AxerCommands.forEach((command) => {
            if (!categories[command.category]) {
                return (categories[command.category] = [command as SlashCommand]);
            } else {
                return categories[command.category].push(command as SlashCommand);
            }
        });

        Object.keys(categories).forEach((category) => {
            embed.addFields({
                name: `${getEmoji("dot")} ${category}`,
                value: categories[category].map((c) => `\`/${c.name}\``).join(", "),
            });
        });

        return command.editReply({
            embeds: [embed],
            components: [buttonsRow],
        });
    }
});

export { help };
