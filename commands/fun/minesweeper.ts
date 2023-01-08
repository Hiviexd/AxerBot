import { Client, GuildMember, CommandInteraction } from "discord.js";
import Minesweeper from "discord.js-minesweeper";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "minesweeper",
	help: {
		description:
			"Play a game of minesweeper! \nDefault settings are 9 x 9 grid, 10 mines.",
		syntax: "/minesweeper\n /minesweeper `<rows>` `<columns>` `<mines>`",
		example:
			"/minesweeper\n /minesweeper `rows: 8` `columns: 8` `mines: 12`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "rows",
				description: "Number must be between 2 and 9, default is 9",
				type: 4,
			},
			{
				name: "columns",
				description: "Number must be between 2 and 9, default is 9",
				type: 4,
			},
			{
				name: "mines",
				description: "Number must be between 1 and 20, default is 10",
				type: 4,
			},
		],
	},
	interaction: true,
	category: "fun",
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		await command.deferReply();

		const rows = command.options.getInteger("rows")
			? Number(command.options.getInteger("rows"))
			: 9;
		const columns = command.options.getInteger("columns")
			? Number(command.options.getInteger("columns"))
			: 9;
		const mines = command.options.getInteger("mines")
			? Number(command.options.getInteger("mines"))
			: 10;

		if (rows < 2 || rows > 9) {
			return command.editReply({
				embeds: [generateErrorEmbed("Rows must be between 2 and 9!")],
			});
		}

		if (columns < 2 || columns > 9) {
			return command.editReply({
				embeds: [
					generateErrorEmbed("Columns must be between 2 and 9!"),
				],
			});
		}

		if (mines < 1 || mines > 20) {
			return command.editReply({
				embeds: [generateErrorEmbed("Mines must be between 1 and 20!")],
			});
		}

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
	},
};
