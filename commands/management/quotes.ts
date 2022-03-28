import { Client, Message } from "discord.js";
import * as quotesSetList from "./subcommands/quotes/quotesSetList";
import * as quotesGetStatus from "./subcommands/quotes/quotesGetStatus";
import * as quotesSetCustom from "./subcommands/quotes/quotesSetCustom";
import * as quotesSetDefault from "./subcommands/quotes/quotesSetDefault";
import * as quotesSetDisabled from "./subcommands/quotes/quotesSetDisabled";
import * as quotesSetWord from "./subcommands/quotes/quotesSetWord";
import * as quotesGetList from "./subcommands/quotes/quotesGetList";
import * as quotesAddWord from "./subcommands/quotes/quotesAddWord";
import * as quotesAllowChannels from "./subcommands/quotes/quotesAllowChannels";
import * as quotesBlockChannels from "./subcommands/quotes/quotesBlockChannels";
import CommandOptionInvalid from "./../../data/embeds/CommandOptionInvalid";
import MissingPermissions from "./../../data/embeds/MissingPermissions";
import { ownerId } from "../../config.json";

export default {
	name: "quotes",
	description: "Configure the random quotes system",
	syntax: "{prefix}quotes `<action>` `<value>`",
	example: "{prefix}quotes `set` `custom`\n{prefix}quotes `status`",
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
	options: [
		"`set` `custom`",
		"`set` `default`",
		"`set` `disabled`",
		"`set` `list`",
		"`set` `<word>`",
		"`block` `<#channels>...`",
		"`allow` `<#channels>...`",
		"`add`",
		"`status`",
		"`viewlist`",
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
