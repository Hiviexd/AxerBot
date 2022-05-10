/*
    * ================ generateConfirmationEmbed.ts
    ? Generates a confirmation embed for the user to confirm their action.
    ? @param message - The message that triggered the command.
    ? @param functionToExecute - The function to execute after the user confirms.
    ? @param warning? - Optional custom warning message to be used when available.
    ? @returns The confirmation embed.
*/

import { Message, ReactionCollector } from "discord.js";

export default(
    message: Message,
    functionToExecute: Function,
    warning?: string
) => {
    warning ? (warning = `${warning}\nReact with :white_check_mark: to continue.`) : (warning = "React with :white_check_mark: to continue.");
    message.channel
				.send({
					embeds: [
						{
							title: "⚠ Are you sure?",
							description: warning,
							color: "#edcd02",
						},
					],
				})
				.then((m) => {
					m.react("✅");

					const collector = new ReactionCollector(m, {
						time: 10000,
						max: 50,
						maxUsers: 100,
					});

					collector.on("collect", async (r, u) => {
						if (r.emoji.name != "✅" || u.id != message.author.id)
							return false;

                        try{functionToExecute();}catch(e){console.log(e);}
                        
						collector.stop("done");

						m.delete();

						return message.channel.send(":white_check_mark: Done!")
                        .then((msg) => {
                            setTimeout(() => {
                                msg.delete();
                            }, 2000);
                        });;
					});

					collector.on("end", (c, r) => {
						if (r != "done") {
							message.channel
								.send(
									":x: You kept me waiting too long! Try again."
								)
								.then((msg) => {
									setTimeout(() => {
										msg.delete();
									}, 2000);
								});

							return m.delete();
						}
					});
				});
};