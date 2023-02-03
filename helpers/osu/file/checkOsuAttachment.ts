import { Message, MessageAttachment } from "discord.js";
import { SendScoreEmbed } from "../../../responses/osu/ScoreEmbed";

export function checkOsuAttachment(message: Message) {
	const messageAttachments = message.attachments;

	if (!messageAttachments) return;

	const findFunction = (file: MessageAttachment) =>
		(file.name && file.name.endsWith(".osr") == true) || false;

	const replayAttachment = messageAttachments.find(findFunction);
	if (replayAttachment) {
		return SendScoreEmbed(replayAttachment.url);
	}
}
