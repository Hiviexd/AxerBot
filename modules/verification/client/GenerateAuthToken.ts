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

	let user_db = await users.findById(user.id);

	if (user_db == null || !user_db) user_db = await createNewUser(user.user);

	const verification_object: IVerificationObject = {
		guild: user.guild.id,
		user: user.id,
		token: token,
	};

	if (
		user_db.pending_verifications.find(
			(v: IVerificationObject) => v.guild == user.guild.id
		) != undefined
	) {
		const pending = user_db.pending_verifications.find(
			(v: IVerificationObject) => v.guild == user.guild.id
		);

		return {
			status: 200,
			message: "Token generated!",
			data: pending,
		};
	}

	user_db.pending_verifications.push(verification_object);

	await users.findByIdAndUpdate(user.id, user_db);

	return {
		status: 200,
		message: "Token generated!",
		data: verification_object,
	};
};
