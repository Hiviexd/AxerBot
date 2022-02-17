const osu = require('node-osu')
const osuApi = new osu.Api('your api key', {
	// baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
	notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
	completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
	parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});
beatmaps = osuApi.getBeatmaps({ u: 'Hivie' }).then(beatmaps => {
    let mapper_name = beatmaps[0].creator;
    let mapping_age =  Date.parse()
	for (let i = 0; i < beatmaps.length; i++){

    }
});