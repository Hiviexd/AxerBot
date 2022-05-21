import { GuildMember } from "discord.js";

export default (text: string, member: GuildMember, guildDbRow: any) => {
	let content = text;

	// ? Guild placeholders

	content = content
		.replace(/{prefix}/gi, `${guildDbRow.prefix}`)
		.replace(/{guild_id}/gi, `${member.guild.id}`)
		.replace(/{guild_name}/gi, member.guild.name);

	// ? User placeholders
	content = content
		.replace(/{member}/gi, `<@${member.user.id}>`)
		.replace(/{member_id}/gi, `${member.user.id}`)
		.replace(/{member_username}/gi, member.user.username)
		.replace(/{member_avatar}/gi, member.user.avatarURL.toString());

	return content;
};
