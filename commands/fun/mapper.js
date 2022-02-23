const { MessageEmbed } = require('discord.js');
const osu = require('node-osu')
const osuApi = new osu.Api('a71340852f272df30a33e8514b7d6a3af45bdec9', {
	// baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
	notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
	completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
	parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});


function parseDate(date) {
	result = new Date(date)
	let year = Number(result.getFullYear())-1970;
	let month = Number(result.getMonth()+1);
	let day = Number(result.getDate());

	let yearText = year>1 ? year+" years": year+"year";
	let monthText = month>1 ? month+" months": month+"month";
	let dayText = day>1 ? day+" days": day+"day";
	return yearText+", "+monthText+", "+dayText;
}
exports.run = async (bot, message, args) => {
	if (args.length<1) {
		message.channel.send("you forgor to put a username :skull:");
		return;
	}
	let username = args.join(" ");
	beatmaps = osuApi.getBeatmaps({u : username }).then(beatmaps => {

		let beatmapsetsWithDupes =[];
		for (let bsId of beatmaps) {
			beatmapsetsWithDupes.push(bsId.beatmapSetId);
		}
		let beatmapsets = beatmapsetsWithDupes.filter((element, index) => {
			return beatmapsetsWithDupes.indexOf(element) === index;
		});

		let beatmapsetCount = beatmapsets.length;
		let rankedBeatmapsetCount = 0; //ranked, approved, qualified
		let lovedBeatmapsetCount = 0; //yeah, i know
		let unrankedBeatmapsetCount = 0; //pending, wip, grave
		let rankedTypes = ["Ranked", "Approved", "Qualified"];
		let unrankedTypes = ["Pending", "WIP", "Graveyard"];
		for (let bsId of beatmapsets) {
			if (beatmaps.some(beatmap => beatmap.beatmapSetId === bsId && rankedTypes.indexOf(beatmap.approvalStatus) !== -1)) { 
				rankedBeatmapsetCount++;
			} else if (beatmaps.some(beatmap => beatmap.beatmapSetId === bsId && unrankedTypes.indexOf(beatmap.approvalStatus) !== -1)) {
				unrankedBeatmapsetCount++;
			} else if (beatmaps.some(beatmap => beatmap.beatmapSetId === bsId && beatmap.approvalStatus === "Loved")) {
				lovedBeatmapsetCount++;
			}
		}

		let favoritesCount = 0;
		for (let bsId of beatmapsets) {
			for (let beatmap of beatmaps) {
				if (beatmap.beatmapSetId === bsId && beatmap.counts.favorites > 0) {
					favoritesCount+=Number(beatmap.counts.favorites);
					break;
				}
			}
		}
		favoritesCount = favoritesCount.toLocaleString("en-US");

		let totalPlaycount = 0;
			for (let beatmap of beatmaps) {
				if (beatmap.counts.plays > 0) {
					totalPlaycount+=Number(beatmap.counts.plays);
				}
			}
		totalPlaycount = totalPlaycount.toLocaleString("en-US");

		let dateList = [];
		let rankedDateList = [];
		for (let beatmap of beatmaps) {
			if (beatmap.submitDate) {
				dateList.push(beatmap.submitDate);
			}
			if (beatmap.approvedDate) {
				rankedDateList.push(beatmap.approvedDate);
			}
		}
		
		let oldestMap =new Date( Math.min(...dateList));
		let newestMap =new Date( Math.max(...dateList));
		//might use those for later
		let oldestRankedMap =new Date( Math.min(...rankedDateList));
		let newestRankedMap =new Date( Math.max(...rankedDateList));
		
		let mappingAgeUnix = new Date(new Date().getTime() - oldestMap.getTime());
		let mappingAge = parseDate(mappingAgeUnix);
		let latestMapsetId = Math.max(...beatmapsets);
		let latestMapset = beatmaps.find(beatmap => beatmap.beatmapSetId == latestMapsetId);
		let latestMapsetTitle = latestMapset.title;
		let latestMapsetArtist = latestMapset.artist;

		let mapperName = latestMapset.creator;
		let mapperId = latestMapset.creatorId;
		let mapperURL = "https://osu.ppy.sh/users/"+mapperId;
		let latestMapsetURL = "https://osu.ppy.sh/beatmapsets/"+latestMapsetId;
		let imageCover = "https://assets.ppy.sh/beatmaps/"+latestMapsetId+"/covers/cover.jpg"
		let mapperPFP = "https://a.ppy.sh/"+mapperId;

		let embed = new MessageEmbed()
			.setTitle(mapperName)
			.setURL(mapperURL)
			.setColor("#e7792b")
			.setThumbnail(mapperPFP)
			.addField("Mapping Age", mappingAge, false)
			.addField("Mapset Count", '✍ '+beatmapsetCount+'  ✅ '+rankedBeatmapsetCount+'  ❤ '+lovedBeatmapsetCount+'  ❓'+unrankedBeatmapsetCount, true)
			.addField("Playcount & Favorites",value='▶ '+totalPlaycount+'  💖 '+favoritesCount , true)
			.addField("Latest Map", `[${latestMapsetArtist} - ${latestMapsetTitle}](${latestMapsetURL})`, false)
			.setImage(imageCover)
			.setTimestamp()
			.setFooter("mwah");
		message.channel.send({ embeds: [embed] });
	});
}

exports.help = {
    name:"mapper"
}