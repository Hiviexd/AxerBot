import {
	Client,
	ChatInputCommandInteraction,
	Message,
	EmbedBuilder,
	User,
} from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import colors from "../../constants/colors";

export default {
	name: "avatar",
	help: {
		description: "Displays the avatar of the mentioned user or the author.",
		syntax: "!avatar <option>",
		example: "/avatar\n /avatar @Hivie\n /avatar <userid>",
	},
	interaction: true,
	config: {
		type: 1,
		options: [
			{
				name: "user",
				description: "Get avatar by user mention (won't ping the user)",
				type: 6,
				max_value: 1,
			},
			{
				name: "id",
				description: "Get avatar by user id",
				type: 3,
				max_value: 1,
			},
		],
	},
	category: "misc",
	run: async (
		bot: Client,
		interaction: ChatInputCommandInteraction,
		args: string[]
	) => {
		await interaction.deferReply(); // ? prevent errors

		let user: User | undefined = undefined;
		const idInput = interaction.options.get("id");
		const userInput = interaction.options.get("user");

		if (idInput && idInput.value) {
			try {
				user = await bot.users.fetch(idInput.value.toString());
			} catch (e) {
				return interaction.editReply({ embeds: [UserNotFound] });
			}
		}

		if (userInput && userInput.value) {
			try {
				user = await bot.users.fetch(userInput.value?.toString());
			} catch (e) {
				return interaction.editReply({ embeds: [UserNotFound] });
			}
		}

		if (!user) {
			user = interaction.user;
		}

		const avatarEmbed = new EmbedBuilder()
			.setColor(colors.purple)
			.setTitle(`${user.tag}'s avatar`)
			.setImage(user.displayAvatarURL({ format: "png", dynamic: true }))
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({
					format: "png",
					dynamic: true,
				})
			);
		interaction.editReply({ embeds: [avatarEmbed] }).catch(console.error);
	},
};
