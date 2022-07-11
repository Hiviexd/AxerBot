import { Schema } from "mongoose";

export default new Schema({
	_id: {
		type: String,
	},
	type: {
		type: String,
		default: "play",
	},
	targets: {
		type: Object,
		default: {},
	},
	channel: String,
	guild: String,
});
