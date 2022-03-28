import "colors";

export function consoleLog(module_name: string, message: string) {
	console.log(`[${module_name}]`.bgYellow.black.concat(message.bgBlue.black));
}

export function consoleError(module_name: string, message: string) {
	console.log(`[${module_name}]`.bgYellow.black.concat(message.bgRed.black));
}

export function consoleCheck(module_name: string, message: string) {
	console.log(
		`[${module_name}]`.bgYellow.black.concat(message.bgGreen.black)
	);
}
