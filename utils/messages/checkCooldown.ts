import { GuildMember, Message } from "discord.js";
import moment from "moment";
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
	try {

		if (!guild) return true;

		let now = new Date();

		if (message.member?.permissions.has("ADMINISTRATOR")) return true; // ? Allow admins to bypass the cooldown

		if (!guild.cooldown[name].channels.includes(channel)) return true;

		if (guild.cooldown[name].size < 0) return false; // ? Check if the channel is blacklisted

		if (guild.cooldown[name].size == 0) return true; // ? If size == 3 => cooldown disabled

		if (
			guild.cooldown[name].current_increments[channel] >=
				guild.cooldown[name].increments &&
			guild.cooldown[name].increments != 0
		) {
			guild.cooldown[name].current_increments[channel] = 0;

			await saveCooldown();

			sendWarn();

			return false;
		}

		// ? Dont allow the command to run if cooldown (sexo)
		if (now < guild.cooldown[name].ends_at[channel]) {
			sendWarn();
			return false;
		}

		async function saveCooldown() {
			// ? Add cooldown again
			now = new Date();
			now.setSeconds(now.getSeconds() + guild.cooldown[name].size);

			guild.cooldown[name].ends_at[channel] = now;

			await database.guilds.findOneAndUpdate({ _id: guild.id }, guild);

			return true;
		}

		function sendWarn() {
			const current_cooldown = guild.cooldown[name].ends_at[channel];

			message.channel
				.send({
					embeds: [
						{
							title: "Command is on cooldown!",
							description: `You need to wait \`${
								current_cooldown.getSeconds() -
								new Date().getSeconds()
							}\` seconds to run this command again!`,
							color: "#ff5050",
						},
					],
				})
				.then((m) => {
					setTimeout(() => {
						m.delete();
					}, 3000);
				});
			return false;
		}

		// ? Add increments
		guild.cooldown[name].ends_at[channel] = now;
		guild.cooldown[name].current_increments[channel] += 1;

		// ? Save increments
		await database.guilds.findOneAndUpdate({ _id: guild.id }, guild);

		// ? Bypass 0 increments
		if (
			guild.cooldown[name].increments < 1 ||
			isNaN(guild.cooldown[name].increments)
		) {
			await saveCooldown();

			return true;
		}

		// ? Allow the command to run (sexo 2 the DLC)
		return true;
	} catch (e) {
		console.error(e);
	}
};
