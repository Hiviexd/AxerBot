import { Schema } from "mongoose";

export const Users = new Schema({
	_id: {
		type: String,
	},
	osu: {
		type: Object,
		default: {
			username: undefined,
			mode: undefined,
		},
	},
});
