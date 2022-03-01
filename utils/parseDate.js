module.exports.parseDate = (date) => {
	result = new Date(date);
	let year = Number(result.getFullYear()) - 1970;
	let month = Number(result.getMonth());
	let day = Number(result.getDate());

	let yearText = year !== 1 ? year + " years" : year + " year";
	let monthText = month !== 1 ? month + " months" : month + " month";
	let dayText = day !== 1 ? day + " days" : day + " day";
	return yearText + ", " + monthText + ", " + dayText;
};
