import moment from "moment";
import { UserCompactStatistics } from "../../../types/user";

export default (stats: UserCompactStatistics | undefined) => {
	if (stats == undefined) return "Never played";
	const playTime = moment.duration(stats.play_time, "seconds");

	const daysLeftOver = Math.floor(playTime.asDays());
	const hours = playTime.hours();
	const totalMinutes = Math.floor(playTime.asMinutes());
	const minutes = totalMinutes % 60; // account for seconds rounding

	let titleValue = Math.round(playTime.asHours());
	let titleUnit = "hours";

	if (titleValue < 2) {
		titleValue = totalMinutes;
		titleUnit = "minutes";
	}

	let timeString = daysLeftOver > 0 ? `${Math.round(daysLeftOver)}d ` : "";
	timeString += `${hours}h ${minutes}m`;

	return timeString;
};
