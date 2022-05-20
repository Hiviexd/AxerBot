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
		S: "<:rankingS:975788645271339048>",
		SS: "<:rankingSS:975787604605808710>",
		SSH: "<:rankingSSH:975787604601610270> ",
		SH: "<:rankingSH:975787843072958584>",
		A: "<:rankingA:975787604610007060>",
		B: "<:rankingB:975787604610019368>",
		C: "<:rankingC:975787604584849448>",
		D: "<:rankingD:975787604815536138>",
		F: "<:f_:977204450865332274>",
	};

	const request = emojis[emoji];

	if (!request) return "";

	return request;
};
