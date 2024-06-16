import { SlashCommandIntegerOption } from "discord.js";
import Minesweeper from "discord.js-minesweeper";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const minesweeper = new SlashCommand()
    .setName("minesweeper")
    .setDescription("Play a game of minesweeper!")
    .setCategory(CommandCategory.Fun)
    .setDMPermission(true)
    .setHelp({
        "default settings": "Default settings are 9 x 9 grid, 10 mines.",
        syntax: "/minesweeper\n /minesweeper `<rows>` `<columns>` `<mines>`",
        example: "/minesweeper\n /minesweeper `rows: 8` `columns: 8` `mines: 12`",
    })
    .addOptions(
        new SlashCommandIntegerOption()
            .setName("rows")
            .setDescription("Number of rows")
            .setMinValue(2)
            .setMaxValue(9),
        new SlashCommandIntegerOption()
            .setName("columns")
            .setDescription("Number of columns")
            .setMinValue(2)
            .setMaxValue(9),
        new SlashCommandIntegerOption()
            .setName("mines")
            .setDescription("Number of mines")
            .setMaxValue(20)
            .setMinValue(1)
    );

minesweeper.setExecutable(async (command) => {
    const rows = command.options.getInteger("rows") ?? 9;
    const columns = command.options.getInteger("columns") ?? 9;
    const mines = command.options.getInteger("mines") ?? 10;

    const minesweeper = new Minesweeper({
        rows,
        columns,
        mines,
        returnType: "emoji",
    });

    const matrix = minesweeper.start();

    matrix
        ? command.editReply(
              `Now playing a **${rows}** x **${columns}** game with **${mines}** mines!\n${matrix}`
          )
        : command.editReply({
              embeds: [generateErrorEmbed("Invalid input")],
          });
});

export { minesweeper };
