import { GuildMember } from "discord.js";
import crypto from "crypto";
import { users, verifications } from "../../../database";
import createNewUser from "../../../database/utils/createNewUser";

export enum VerificationType {
    "validate" = "verification_validate",
    "default" = "verification",
}

export interface IVerificationObject {
    target_guild: string;
    target_user: string;
    createdAt: Date;
    _id: string;
    code: number;
    type: VerificationType;
    target_channel?: string;
}

async function generateRandomNumber() {
    const minm = 100000;
    const maxm = 999999;

    try {
        let code = Math.floor(Math.random() * (maxm - minm + 1)) + minm;

        if (await verifications.findOne({ code: code }))
            code = Math.floor(Math.random() * (maxm - minm + 1)) + minm;

        return code;
    } catch (e) {
        return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    }
}

export default async (
    user: GuildMember,
    type?: VerificationType,
    channel?: string
): Promise<{
    status: number;
    message: string;
    data?: IVerificationObject;
}> => {
    const id = crypto.randomBytes(30).toString("hex").slice(30);

    let user_db = await users.findById(user.id);

    if (user_db == null || !user_db) user_db = await createNewUser(user.user);

    const verification_object: IVerificationObject = {
        _id: id,
        code: await generateRandomNumber(),
        target_guild: user.guild.id,
        target_user: user.id,
        createdAt: new Date(),
        type: type || VerificationType.default,
        target_channel:
            type == VerificationType.validate ? (channel as string) : undefined,
    };

    if (!user_db)
        return {
            status: 404,
            message: "User not found! Try again.",
        };

    const pendingUserVerification = await verifications.findOne({
        target_guild: user.guild.id,
        target_user: user.id,
    });

    if (pendingUserVerification)
        return {
            status: 200,
            message: "Token generated!",
            data: pendingUserVerification.toObject(),
        };

    await verifications.create(verification_object);

    return {
        status: 200,
        message: "Token generated!",
        data: verification_object,
    };
};
