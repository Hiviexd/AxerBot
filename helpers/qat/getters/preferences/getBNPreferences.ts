import { QatUser } from "../../../../types/qat";

export default {
	positive: (user: QatUser) => {
		let result = ``;
		const config = user.mapperPreferences
			.concat(user.osuStylePreferences)
			.concat(user.taikoStylePreferences)
			.concat(user.catchStylePreferences)
			.concat(user.maniaStylePreferences)
			.concat(user.maniaKeymodePreferences)
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
			.concat(user.osuStyleNegativePreferences)
			.concat(user.taikoStyleNegativePreferences)
			.concat(user.catchStyleNegativePreferences)
			.concat(user.maniaStyleNegativePreferences)
			.concat(user.maniaKeymodeNegativePreferences)
			.concat(user.genreNegativePreferences)
			.concat(user.languageNegativePreferences)
			.concat(user.detailNegativePreferences);

		config.forEach((c) => {
			result = result.concat(`<:x:996082571261784114> ${c}\n`);
		});

		if (result.trim() == "") return "Not specified.";

		return result;
	},
};
