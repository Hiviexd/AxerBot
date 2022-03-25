import { Message, ReactionCollector } from "discord.js";
import MissingPermissions from "../../../../data/embeds/MissingPermissions";
import * as database from "../../../../database";
import CommandOptionInvalid from "../../../../data/embeds/CommandOptionInvalid";

export const config = {
	name: "remove",
	description: "Remove a channel from a category.",
	syntax: "!cooldown `remove` `<channel>` `<category>`",
};

export async function run(message: Message, args: string[]) {
	let guild = await database.guilds.findOne({ _id: message.guildId });
	const categories = ["contests", "fun", "misc", "management", "osu"];

	if (!message.member?.permissions.has("ADMINISTRATOR"))
		return message.channel.send({ embeds: [MissingPermissions] });

	args.shift();

	if (!args[0] || !args[1])
		return message.channel.send({ embeds: [CommandOptionInvalid] });

	const channel = message.guild?.channels.cache.find(
		(c) =>
			c.name.toLowerCase() == args[0].toLowerCase() &&
			c.type == "GUILD_TEXT"
	);

	const category = args[1].toLowerCase();

	if (!channel)
		return message.channel.send({
			embeds: [
				{
					title: "What?",
					description: `I don't know any channel called \`${args[0].toLowerCase()}\`!`,
					color: "#ff5050",
				},
			],
		});

	if (!categories.includes(category))
		return message.channel.send({
			embeds: [
				{
					title: "What?",
					description: `I don't know any category called \`${category}\`!`,
					color: "#ff5050",
				},
			],
		});

	if (guild.cooldown[category].channels.includes(channel.name.toLowerCase()))
		return message.channel.send({
			embeds: [
				{
					title: "Bro",
					description: `The category \`${category}\` does not have any channel called \`${channel.name}\`!`,
					color: "#ff5050",
				},
			],
		});

	if (guild.cooldown[category].channels.length < 2) return message.channel.send({ 
		embeds: [
			{
			title: "Wait...",
			description: `The category \`${category}\` have 1 channel configured, use \`${guild.prefix}cooldown clear ${category}\` instead!`,
			color: "#ff5050",
		}
		]	
	})

	// ? Remove channel from "Channels" array
	const index = guild.cooldown[category].channels.findIndex(
		(c: any) => c == channel.id
	);
	guild.cooldown[category].channels.splice(index, 1);

	// ? Remove channel from "ends_at" object
	delete guild.cooldown[category].ends_at[channel.id];

	// ? Remove channel from "current_increments" object
	delete guild.cooldown[category].current_increments[channel.id];

	message.channel
		.send({
			embeds: [
				{
					title: "⚠ Are you sure?",
					description: "React with :white_check_mark: to continue",
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

				await database.guilds.findOneAndUpdate(
					{ _id: guild._id },
					guild
				);

				collector.stop("done");

				m.delete();

				return message.channel.send(":white_check_mark: Done!");
			});

			collector.on("end", (c, r) => {
				if (r != "done") {
					message.channel.send(
						":x: You kept me waiting too long! Try again."
					);

					return m.delete();
				}
			});
		});
}
