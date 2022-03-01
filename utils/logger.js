require("colors");

exports.consoleLog = (module_name, message) => {
	console.log(`[${module_name}]`.bgYellow.black.concat(message.bgBlue.black));
};

exports.consoleError = (module_name, message) => {
	console.log(`[${module_name}]`.bgYellow.black.concat(message.bgRed.black));
};

exports.consoleCheck = (module_name, message) => {
	console.log(
		`[${module_name}]`.bgYellow.black.concat(message.bgGreen.black)
	);
};
