import {
	Message,
	CommandInteraction,
	Modal,
	TextInputComponent,
	ModalActionRowComponent,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import crypto from "crypto";

export default {
	name: "message",
	group: "set",
	help: {
		description:
			"Set the message that will be sent on the system channel (will open a popup that takes text input)",
		syntax: "/verification `set message`",
		placeholders: "`{member}` - a ping of the member that will be verified",
		"example message": "Hello {member} and welcome to this server!",
	},
	run: async (command: CommandInteraction, args: string[]) => {
		if (!command.member) return;

		if (typeof command.member?.permissions == "string") return;

		if (
			!command.member.permissions.has("MANAGE_GUILD", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		const modalId = crypto.randomBytes(15).toString("hex").slice(10);
		const modal = new Modal()
			.setTitle("Verification welcome message")
			.setCustomId(modalId);

		const textInput = new TextInputComponent()
			.setLabel("Message")
			.setStyle("PARAGRAPH")
			.setValue(guild.verification.message)
			.setCustomId("newWelcomeMessage");

		const firstTextInput =
			new MessageActionRow<ModalActionRowComponent>().addComponents(
				textInput
			);

		modal.addComponents(firstTextInput);

		await command.showModal(modal);

		command.client.on(
			"interactionCreate",
			async (interaction): Promise<any> => {
				if (!interaction.isModalSubmit()) return;
				if (interaction.customId != modalId) return;

				await interaction.deferReply();
				const message =
					interaction.fields.getField("newWelcomeMessage");

				let guild = await guilds.findById(command.guildId);
				if (!guild)
					return interaction.editReply(
						"This guild isn't validated, try again after some seconds.."
					);

				guild.verification.message = message.value;

				await guilds.findByIdAndUpdate(command.guildId, guild);

				const previewButton = new MessageButton()
					.setLabel("Preview message")
					.setStyle("PRIMARY")
					.setCustomId(
						`verificationpreviewmessage|${interaction.user.id}`
					);

				const previewButtonActionRow =
					new MessageActionRow().addComponents(previewButton);

				interaction.editReply({
					embeds: [generateSuccessEmbed("Message changed!")],
					components: [previewButtonActionRow],
				});
			}
		);
	},
};
