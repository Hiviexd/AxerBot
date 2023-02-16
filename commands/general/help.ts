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
    "General",
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
