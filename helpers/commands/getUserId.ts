import { ChatInputCommandInteraction, Message } from "discord.js";

export function getUserId(target: ChatInputCommandInteraction | Message) {
    if (target.guild && target.member && target.member.user.id)
        return target.member.user.id;

    if ((target as Message).author && (target as Message).author.id)
        return (target as Message).author.id;

    if ((target as ChatInputCommandInteraction).user)
        return (target as ChatInputCommandInteraction).user.id;

    return "";
}
