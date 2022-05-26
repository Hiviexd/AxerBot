import { Interaction, Role } from "discord.js";

export default async (interaction: Interaction) => {
	try {
		if (!interaction.isSelectMenu()) return;

		if (interaction.customId != "private_roles") return;

		const roles: any = {
			spectator:
				interaction.guild?.roles.cache.find(
					(r: Role) => r.name == "Spectator"
				) || interaction.guild?.roles.cache.get("932662937326329916"),
			participant:
				interaction.guild?.roles.cache.find(
					(r: Role) => r.name == "Participant"
				) || interaction.guild?.roles.cache.get("932663311529558016"),
		};

		const member = await interaction.guild?.members.fetch(
			interaction.user.id
		);

		if (!member)
			return interaction.reply({
				content: "Sorry, i can't add roles for you rn.",
				ephemeral: true,
			});

		member.roles.add(roles[interaction.values[0]]);

		// ? This will remove the other role (If you're a spectator, you only can have the spectator role)
		Object.keys(roles).forEach((role) => {
			if (roles[role].id != roles[interaction.values[0]])
				member.roles.remove(roles[role]);
		});

		return interaction.reply({
			content: `You're a ${interaction.values[0]} now, ${
				member.nickname || interaction.user.username
			}!`,
			ephemeral: true,
		});
	} catch (e) {
		console.error(e);

		if (!interaction.isSelectMenu()) return;

		return interaction.reply({
			content: "Sorry, i can't add roles for you rn.",
			ephemeral: true,
		});
	}
};
