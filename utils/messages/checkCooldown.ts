import { GuildMember, Message } from "discord.js";
import * as database from "./../../database";

/**
 * ? RETURN TRUE: Allow command to run
 * ? RETURN FALSE: Don't allow the command to run
 */
export default async (
	guild: any,
	name: any,
	channel: string,
	message: Message
) => {
	const now = new Date();

	if (message.member?.permissions.has("ADMINISTRATOR")) return true; // ? Allow admins to bypass the cooldown

	if (!guild.cooldown[name].channels.includes(channel)) return true;

	if (guild.cooldown[name].size < 0) return false; // ? Check if the channel is blacklisted

	if (guild.cooldown[name].size == 0) return true; // ? If size == 3 => cooldown disabled

	if (
		guild.cooldown[name].current_increments >=
			guild.cooldown[name].increments &&
		guild.cooldown[name].increments != 0
	) {
		guild.cooldown[name].current_increments = 0;
		await database.guilds.findOneAndUpdate({ _id: guild.id }, guild);
		return true;
	}

	// ? Dont allow the command to run
	if (now < guild.cooldown[name].ends_at[channel]) return false;

	now.setSeconds(now.getSeconds() + guild.cooldown[name].size);

	guild.cooldown[name].ends_at[channel] = now;
	guild.cooldown[name].current_increments += 1;

	await database.guilds.findOneAndUpdate({ _id: guild.id }, guild);

	return true;
};
