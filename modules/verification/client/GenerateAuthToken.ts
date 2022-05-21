import { GuildMember } from "discord.js";
import crypto from "crypto";
import { users } from "../../../database";
import createNewUser from "../../../database/utils/createNewUser";

export interface IVerificationObject {
	guild: string;
	user: string;
	token: string;
}

export default async (
	user: GuildMember
): Promise<{
	status: number;
	message: string;
	data?: IVerificationObject;
}> => {
	const token = crypto.randomBytes(30).toString("hex").slice(30);

	const user_db = await users.findById(user.id);

	if (user_db == null) await createNewUser(user.user);

	const verification_object: IVerificationObject = {
		guild: user.guild.id,
		user: user.id,
		token: token,
	};

	if (
		user_db.pending_verifications.find(
			(v: IVerificationObject) => v.guild == user.guild.id
		) != undefined
	)
		return {
			status: 400,
			message: `You already have a pending verification on **${
				user.guild.name
			}**. Please, use the old link: https://axer-auth.herokuapp.com/authorize?code=${
				user_db.pending_verifications.find(
					(v: IVerificationObject) => v.guild == user.guild.id
				).token
			}&user=${user.id}`,
		};

	user_db.pending_verifications.push(verification_object);

	await users.findByIdAndUpdate(user.id, user_db);

	return {
		status: 200,
		message: "Token generated!",
		data: verification_object,
	};
};
