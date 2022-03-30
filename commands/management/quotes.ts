import { Client, Message } from "discord.js";
import quotesSetList from "./subcommands/quotes/quotesSetList";
import quotesGetStatus from "./subcommands/quotes/quotesGetStatus";
import quotesSetCustom from "./subcommands/quotes/quotesSetCustom";
import quotesSetDefault from "./subcommands/quotes/quotesSetDefault";
import quotesSetDisabled from "./subcommands/quotes/quotesSetDisabled";
import quotesSetWord from "./subcommands/quotes/quotesSetWord";
import quotesGetList from "./subcommands/quotes/quotesGetList";
import quotesAddWord from "./subcommands/quotes/quotesAddWord";
import quotesAllowChannels from "./subcommands/quotes/quotesAllowChannels";
import quotesBlockChannels from "./subcommands/quotes/quotesBlockChannels";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";

export default {
	name: "quotes",
	help: {
		description: "Configure the random quotes system",
		syntax: "{prefix}quotes `<action>` `<value>`",
		example: "{prefix}quotes `set` `custom`\n {prefix}quotes `status`",
		options: [
			"`setcustom`",
			"`setdefault`",
			"`setdisabled`",
			"`setlist`",
			"`setword` `<word>`",
			"`block` `<#channels>...`",
			"`allow` `<#channels>...`",
			"`add`",
			"`status`",
			"`viewlist`",
		],
	},
	subcommands: [
		quotesSetList,
		quotesGetList,
		quotesGetStatus,
		quotesSetCustom,
		quotesSetDefault,
		quotesSetDisabled,
		quotesSetWord,
		quotesAddWord,
		quotesBlockChannels,
		quotesAllowChannels,
	],
	category: "management",
	run: (bot: Client, message: Message, args: string[]) => {
		if (!message.guild || !message.member) return;

		// ? Only guild managers and admins can use this
		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		// const action = args[1]; // {prefix}quotes set <argument>
		// const getter = args[0]; // {prefix}quotes <something>

		// if (!action && !getter)
		// 	return message.channel.send({
		// 		embeds: [CommandOptionInvalid],
		// 	});

		// /**
		//  * * =========== ACTIONS
		//  * * custom -> switch quotes mode to custom list
		//  * * default -> switch quotes mode to default list
		//  * * list -> switch quotes to list
		//  * * disabled -> disables quote system
		//  */

		// switch (getter) {
		// 	case "status": {
		// 		// code for returning current mode;
		// 		quotesGetStatus.run(message);
		// 		break;
		// 	}
		// 	case "viewlist": {
		// 		// code for returning current mode;
		// 		quotesGetList.run(message);
		// 		break;
		// 	}
		// 	case "add": {
		// 		quotesAddWord.run(message);
		// 		break;
		// 	}
		// 	case "block": {
		// 		quotesBlockChannels.run(message, args);
		// 		break;
		// 	}
		// 	case "allow": {
		// 		quotesAllowChannels.run(message, args);
		// 		break;
		// 	}
		// 	case "set": {
		// 		switch (action) {
		// 			case "disabled": {
		// 				quotesToggle.run(message, false);
		// 				break;
		// 			}

		// 			case "custom": {
		// 				quotesSetCustom.run(message);
		// 				break;
		// 			}

		// 			case "default": {
		// 				quotesSetDefault.run(message);
		// 				break;
		// 			}

		// 			case "list": {
		// 				quotesSetList.run(message);
		// 				break;
		// 			}

		// 			case "word": {
		// 				quotesSetWord.run(message, args[2]);
		// 				break;
		// 			}

		// 			default: {
		// 				// ? Runs if the option is invalid
		// 				message.channel.send({
		// 					embeds: [CommandOptionInvalid],
		// 				});
		// 			}
		// 		}
		// 		break;
		// 	}

		// 	default: {
		// 		message.channel.send({
		// 			embeds: [CommandOptionInvalid],
		// 		});
		// 	}
		// }
	},
};
