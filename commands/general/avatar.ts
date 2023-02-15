import {
    Client,
    ChatInputCommandInteraction,
    Message,
    EmbedBuilder,
    User,
} from "discord.js";
import UserNotFound from "../../responses/embeds/UserNotFound";
import colors from "../../constants/colors";
import { SlashCommand } from "../../models/commands/SlashCommand";
import abbreviation from "../../helpers/text/abbreviation";
import osuApi from "../../helpers/osu/fetcher/osuApi";

const avatar = new SlashCommand(
    "avatar",
    "Displays the avatar of the mentioned user or the author.",
    "General",
    false,
    {
        description: "Displays the avatar of the mentioned user or the author.",
        syntax: "/avatar <option>",
        example: "/avatar\n /avatar @Hivie\n /avatar <userid>",
    }
);

avatar.builder
    .addUserOption((option) =>
        option.setName("user").setDescription("Get avatar by user")
    )
    .addStringOption((option) =>
        option.setName("id").setDescription("Get avatar by user id")
    )
    .addStringOption((option) =>
        option.setName("osu_username").setDescription("Get user's osu avatar")
    );

avatar.setExecuteFunction(async (command) => {
    // ? prevent errors

    let user: User | undefined = undefined;
    const osuInput = command.options.getString("osu_username");
    const idInput = command.options.getString("id");
    const userInput = command.options.getUser("user");

    if (osuInput) return sendOsuAvatar();

    async function sendOsuAvatar() {
        if (!osuInput) return;

        const osuUser = await osuApi.fetch.user(osuInput);

        if (!osuUser || !osuUser.data || osuUser.status != 200)
            return command.editReply({ embeds: [UserNotFound] });

        const avatarEmbed = new EmbedBuilder()
            .setColor(colors.purple)
            .setTitle(`${abbreviation(osuInput)} osu! avatar`)
            .setImage(`https://a.ppy.sh/${osuUser.data.id}`)
            .setFooter({
                text: `Requested by ${command.user.tag}`,
                iconURL: command.user.displayAvatarURL({
                    extension: "png",
                }),
            });
        command.editReply({ embeds: [avatarEmbed] }).catch(console.error);
    }

    if (idInput) {
        try {
            user = await command.client.users.fetch(idInput);
        } catch (e) {
            return command.editReply({ embeds: [UserNotFound] });
        }
    }

    if (userInput) {
        try {
            user = await command.client.users.fetch(userInput);
        } catch (e) {
            return command.editReply({ embeds: [UserNotFound] });
        }
    }

    if (!user) {
        user = command.user;
    }

    const avatarEmbed = new EmbedBuilder()
        .setColor(colors.purple)
        .setTitle(`${user.tag}'s avatar`)
        .setImage(user.displayAvatarURL({ extension: "png" }))
        .setFooter({
            text: `Requested by ${command.user.tag}`,
            iconURL: command.user.displayAvatarURL({
                extension: "png",
            }),
        });
    command.editReply({ embeds: [avatarEmbed] }).catch(console.error);
});

export default avatar;

// export default {
// 	name: "avatar",
// 	help: {
// 		description: "Displays the avatar of the mentioned user or the author.",
// 		syntax: "/avatar <option>",
// 		example: "/avatar\n /avatar @Hivie\n /avatar <userid>",
// 	},
// 	command: true,
// 	config: {
// 		type: 1,
// 		options: [
// 			{
// 				name: "user",
// 				description: "Get avatar by user mention (won't ping the user)",
// 				type: 6,
// 				max_value: 1,
// 			},
// 			{
// 				name: "id",
// 				description: "Get avatar by user id",
// 				type: 3,
// 				max_value: 1,
// 			},
// 		],
// 	},
// 	category: "General",
// 	run: async (
// 		bot: Client,
// 		interaction: ChatInputCommandInteraction,
// 		args: string[]
// 	) => {
// 		await interaction.deferReply(); // ? prevent errors

// 		let user: User | undefined = undefined;
// 		const idInput = interaction.options.get("id");
// 		const userInput = interaction.options.get("user");

// 		if (idInput && idInput.value) {
// 			try {
// 				user = await bot.users.fetch(idInput.value.toString());
// 			} catch (e) {
// 				return interaction.editReply({ embeds: [UserNotFound] });
// 			}
// 		}

// 		if (userInput && userInput.value) {
// 			try {
// 				user = await bot.users.fetch(userInput.value?.toString());
// 			} catch (e) {
// 				return interaction.editReply({ embeds: [UserNotFound] });
// 			}
// 		}

// 		if (!user) {
// 			user = interaction.user;
// 		}

// 		const avatarEmbed = new EmbedBuilder()
// 			.setColor(colors.purple)
// 			.setTitle(`${user.tag}'s avatar`)
// 			.setImage(user.displayAvatarURL({ format: "png", dynamic: true }))
// 			.setFooter(
// 				`Requested by ${interaction.user.tag}`,
// 				interaction.user.displayAvatarURL({
// 					format: "png",
// 					dynamic: true,
// 				})
// 			);
// 		interaction.editReply({ embeds: [avatarEmbed] }).catch(console.error);
// 	},
// };
