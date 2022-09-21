import {
	Client,
	CommandInteraction,
	Modal,
	TextInputComponent,
	ModalActionRowComponent,
	MessageActionRow,
	InteractionCollector,
} from "discord.js";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import crypto from "crypto";

export default {
	name: "editmessage",
	help: {
		description: "Edits one of the bot's messages",
		syntax: "/editmessage `<channel>` `<messageId>`",
		example: "/editmessage `#general` `1017599518407139451`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "channel",
				type: 7,
				description: "Text channel of the message",
				required: true,
			},
			{
				name: "messageid",
				type: 3,
				description: "ID of the message to edit",
				required: true,
			},
		],
	},
	interaction: true,
	category: "management",
	permissions: ["MANAGE_MESSAGES"],
	run: async (bot: Client, command: CommandInteraction, args: string[]) => {
		if (!command.member || !command.guild) return;

		if (typeof command.member?.permissions == "string") return;

		const channel = command.options.getChannel("channel", true);
		const messageId = command.options.getString("messageid", true);

		if (!command.channel || !command.channel.isText()) return;

		const guild_channel = await command.guild.channels.fetch(channel.id);
		if (!guild_channel || !guild_channel.isText()) return;

		const message = await command.guild.channels
			.fetch(guild_channel.id)
			.then((channel) => {
				if (channel && channel.isText()) {
					return channel.messages.fetch(messageId);
				} else {
					return undefined;
				}
			})
			.catch(() => {
				return undefined;
			});

		const modalId = crypto.randomBytes(15).toString("hex").slice(10);
		const modal = new Modal().setTitle("Edit message").setCustomId(modalId);

		const textInput = new TextInputComponent()
			.setCustomId("edit-message-text-input")
			.setStyle("PARAGRAPH")
			.setLabel("Message")
			.setPlaceholder(
				message
					? message.content
					: "Message unknown, will result in an error after submitting."
			)
			.setValue(message ? message.content : "")
			.setRequired(true);

		const firstTextInput =
			new MessageActionRow<ModalActionRowComponent>().addComponents(textInput);

		modal.addComponents(firstTextInput);
		await command.showModal(modal);

		const collector = new InteractionCollector(command.client, {
			time: 120000,
			filter: (interaction) => interaction.user.id == command.user.id,
		});

		collector.on("collect", async (interaction): Promise<any> => {
			if (!interaction.isModalSubmit()) return;
			!interaction.deferred
				? await interaction.deferReply({ ephemeral: true })
				: void {};

			if (
				interaction.customId === modalId &&
				guild_channel &&
				guild_channel.isText() &&
				message
			) {
				const editedMessage = interaction.fields.getTextInputValue(
					"edit-message-text-input"
				);

				if (!message) return;
				await guild_channel.messages
					.fetch(messageId)
					.then((message) => {
						message.edit(editedMessage);
					})
					.then(() => {
						interaction.followUp({
							embeds: [
								generateSuccessEmbed(
									"✅ Message edited successfully."
								),
							],
							ephemeral: true,
						});
					});
			} else {
				interaction.followUp({
					embeds: [
						generateErrorEmbed(
							"❗ Please specify a valid text channel/message ID."
						),
					],
					ephemeral: true,
				});
			}

			// bye
			collector.stop();
		});
	},
};
