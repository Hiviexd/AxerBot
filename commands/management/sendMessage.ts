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
	name: "sendmessage",
	help: {
		description: "Sends a message to a specified channel",
		syntax: "/sendmessage `<channel>`",
		example: "/sendmessage `#general`",
	},
	config: {
		type: 1,
		options: [
			{
				name: "channel",
				type: 7,
				description: "Text channel to send the message",
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

		if (!command.channel || !command.channel.isText()) return;

		const guild_channel = await command.guild.channels.fetch(channel.id);

		const modalId = crypto.randomBytes(15).toString("hex").slice(10);
		const modal = new Modal().setTitle("Send message").setCustomId(modalId);

		const textInput = new TextInputComponent()
			.setCustomId("send-message-text-input")
			.setStyle("PARAGRAPH")
			.setLabel("Message")
			.setRequired(true);

		const firstTextInput = new MessageActionRow<ModalActionRowComponent>().addComponents(textInput);

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
				guild_channel.isText()
			) {
				const message = interaction.fields.getTextInputValue(
					"send-message-text-input"
				);

				if (!message) return;
				await guild_channel.send(message).then(() => {
					interaction.followUp({
						embeds: [
							generateSuccessEmbed(
								"✅ Message sent successfully."
							),
						],
						ephemeral: true,
					});
				});
			} else {
				interaction.followUp({
					embeds: [
						generateErrorEmbed(
							"❗ Please specify a valid text channel."
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
