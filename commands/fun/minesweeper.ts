import { Client, GuildMember, ChatInputCommandInteraction } from "discord.js";
import Minesweeper from "discord.js-minesweeper";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";

const minesweeper = new SlashCommand(
    "minesweeper",
    "Play a game of minesweeper! \nDefault settings are 9 x 9 grid, 10 mines.",
    "Fun",
    false,
    {
        syntax: "/minesweeper\n /minesweeper `<rows>` `<columns>` `<mines>`",
        example:
            "/minesweeper\n /minesweeper `rows: 8` `columns: 8` `mines: 12`",
    }
);

minesweeper.builder
    .addIntegerOption((o) =>
        o
            .setName("rows")
            .setDescription("Number of rows")
            .setMinValue(2)
            .setMaxValue(9)
    )
    .addIntegerOption((o) =>
        o
            .setName("columns")
            .setDescription("Number of columns")
            .setMinValue(2)
            .setMaxValue(9)
    )
    .addIntegerOption((o) =>
        o
            .setName("mines")
            .setDescription("Number of mines")
            .setMaxValue(20)
            .setMinValue(1)
    );

minesweeper.setExecuteFunction(async (command) => {
    const rows = command.options.getInteger("rows") ?? 9;
    const columns = command.options.getInteger("columns") ?? 9;
    const mines = command.options.getInteger("mines") ?? 10;

    // if (rows < 2 || rows > 9) {
    //     return command.editReply({
    //         embeds: [generateErrorEmbed("Rows must be between 2 and 9!")],
    //     });
    // }

    // if (columns < 2 || columns > 9) {
    //     return command.editReply({
    //         embeds: [
    //             generateErrorEmbed("Columns must be between 2 and 9!"),
    //         ],
    //     });
    // }

    // if (mines < 1 || mines > 20) {
    //     return command.editReply({
    //         embeds: [generateErrorEmbed("Mines must be between 1 and 20!")],
    //     });
    // }

    const minesweeper = new Minesweeper({
        rows,
        columns,
        mines,
        returnType: "emoji",
    });

    const matrix = minesweeper.start();

    if (!(command.member instanceof GuildMember)) return;

    matrix
        ? command.editReply(
              `Now playing a **${rows}** x **${columns}** game with **${mines}** mines!\n${matrix}`
          )
        : command.editReply({
              embeds: [generateErrorEmbed("Invalid input")],
          });
});

export default minesweeper;
