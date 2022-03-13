import { Client, Message } from "discord.js";
import { quotesSetList } from "./subcommands/quotesSetList"
import { quotesGetStatus } from "./subcommands/quotesGetStatus"
import { quotesSetMode } from "./subcommands/quotesSetMode"
import { quotesToggle } from "./subcommands/quotesToggle";
import CommandOptionInvalid from "./../../data/embeds/CommandOptionInvalid"

export default {
	name: "quotes",
	description: "Configure the random quotes system",
	syntax: "!quotes set `<option>`\n!quotes status",
	example: "!quotes `set custom`\n!quotes `status`",
	options: ["`set` `custom`", "`set` `default`", "`set` `disabled`", "`set` `list`", "`status`"],
	category: "fun",
	run: (bot: Client, message: Message, args: string[]) => {

		/**
		 * TODO: Upload -> Parse -> Save -> Send -> Review
		 * ?                                        ^^^^
		 */

		const action = args[1]; // !quotes set <argument>
		const getter = args[0] // !quotes <something>

		if (!action && !getter) return message.channel.send({
			embeds: [CommandOptionInvalid]
		})
		
		/**
		 * * =========== ACTIONS 
		 * * custom -> switch quotes mode to custom list
		 * * default -> switch quotes mode to default list
		 * * list -> switch quotes to list 
		 * * disabled -> disables quote system
		*/

		switch(getter) {
			case "status": {
				// code for returning current mode;
				quotesGetStatus(message)
				break;
			}
			case "set": {
				switch(action) {		
					case "disabled": {
		
						quotesToggle(message, false)
						break;
					}
		
					case "custom": {

						quotesSetMode(message, "custom")
						break;
					}
		
					case "default": {
		
						quotesSetMode(message, "default")
						break;
					}
		
					case "list": {
		
						quotesSetList(message)
						break;
					}
		
					default: {
		
						// ? Runs if the option is invalid
						message.channel.send({
							embeds: [CommandOptionInvalid]
						})
					}
				}

				break;
			}

			default: {
				message.channel.send({
					embeds: [CommandOptionInvalid]
				})
			}
		}
	},
};
