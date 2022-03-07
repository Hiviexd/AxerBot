export default (emoji: string) => {
	const emojis: any = {
		wip: "<:pending:950465284026822716>",
		pending: "<:pending:950465284026822716>",
		graveyard: "<:pending:950465284026822716>",
		loved: "<:loved:950465283770945547>",
		qualified: "<:qualified:950465359763361913>",
		ranked: "<:ranked:950465283917762590>",
	};

	const request = emojis[emoji];

	if (!request) return "";

	return request;
};
