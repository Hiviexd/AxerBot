import { Schema } from "mongoose";

export default new Schema({
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
