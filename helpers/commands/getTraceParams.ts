import { Message } from "discord.js";

export default (
	args: string[],
	defaultParam: string,
	maxSize: number,
	validParams: string[]
) => {
	const params: string[] = [];

	args.forEach((p) => {
		if (validParams.includes(p.toLowerCase())) params.push(p);
	});

	params.slice(maxSize - 1, params.length);

	if (params.length < 1) return defaultParam;

	if (maxSize > 1) return params;

	return params;
};
