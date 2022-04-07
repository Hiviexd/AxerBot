export default (emoji: string) => {
	const emojis: any = {
		wip: "<:pending:959908163921010758>",
		pending: "<:pending:959908163921010758>",
		graveyard: "<:pending:959908163921010758>",
		loved: "<:loved:950465283770945547>",
		qualified: "<:qualified:950465359763361913>",
		approved: "<:qualified:950465359763361913>",
		ranked: "<:ranked:959908115254489108>",
		osu: "<:osu:950459762682781696>",
		mania: "<:mania:950459762577903616>",
		taiko: "<:taiko:950459762229788733>",
		catch: "<:catch:950459762590486568>",
		fruits: "<:catch:950459762590486568>",
	};

	const request = emojis[emoji];

	if (!request) return "";

	return request;
};
