import { Message } from "discord.js";
import RequestEmbed from "../../../responses/modhub/RequestEmbed";

export default (url: URL, type: string, message: Message) => {
	if (type == "request") RequestEmbed(url, message);
};
