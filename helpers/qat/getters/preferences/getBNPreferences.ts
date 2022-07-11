import { QatUser } from "../../../../types/qat";

export default {
	positive: (user: QatUser) => {
		let result = ``;
		const config = user.mapperPreferences
			.concat(user.genrePreferences)
			.concat(user.languagePreferences)
			.concat(user.detailPreferences);

		config.forEach((c) => {
			result = result.concat(`<:check:995849401492832316> ${c}\n`);
		});

		if (result.trim() == "") return "Not specified.";

		return result;
	},
	negative: (user: QatUser) => {
		let result = ``;
		const config = user.mapperNegativePreferences
			.concat(user.genreNegativePreferences)
			.concat(user.languageNegativePreferences)
			.concat(user.detailNegativePreferences);

		config.forEach((c) => {
			result = result.concat(`:x: ${c}\n`);
		});

		if (result.trim() == "") return "Not specified.";

		return result;
	},
};
