const { MessageEmbed } = require("discord.js");
module.exports = {
	name: "guildMemberRemove",
	execute(member) {
		if (!member.guild.channels.cache.find((c) => c.name === "wasteland"))
			return;
		const memberRoles = member.roles.cache
			.filter((roles) => roles.id !== member.guild.id)
			.map((role) => role.toString());
		//.map(role => role.name);
		const embed = new MessageEmbed()
			.setColor("#d97f36")
			.setAuthor(
				`${member.user.username}`,
				member.user.displayAvatarURL()
			)
			.setDescription(
				`:wave: ${member.user} has left the server!\n\n**Roles:** \n${memberRoles}`
			)
			.setTimestamp();

		console.log("User " + member.user.tag + " has left the server!");
		member.guild.channels.cache
			.find((c) => c.name === "wasteland")
			.send({ embeds: [embed] });
	},
};
