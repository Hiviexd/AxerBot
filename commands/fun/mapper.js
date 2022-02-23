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
		message.channel.send("what am i supposed to search for wtf");
		return;
	}
	let username = args.join(" ");
	beatmaps = osuApi.getBeatmaps({u : username }).then(beatmaps => {
		let mapperName = beatmaps[0].creator;
		let mapperId = beatmaps[0].creatorId;
		console.log("mapper name: "+mapperName);
		console.log("mapper id: "+mapperId);

		let beatmapsetsWithDupes =[];
		for (let bsId of beatmaps) {
			beatmapsetsWithDupes.push(bsId.beatmapSetId);
		}
		let beatmapsets = beatmapsetsWithDupes.filter((element, index) => {
			return beatmapsetsWithDupes.indexOf(element) === index;
		});

		let beatmapsetCount = beatmapsets.length;
		console.log("total set count: "+beatmapsetCount);
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
		console.log("ranked beatmapset count: "+rankedBeatmapsetCount);
		console.log("loved beatmapset count: "+lovedBeatmapsetCount);
		console.log("unranked beatmapset count: "+unrankedBeatmapsetCount);

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
		console.log("favorites count: "+favoritesCount);

		let totalPlaycount = 0;
			for (let beatmap of beatmaps) {
				if (beatmap.counts.plays > 0) {
					totalPlaycount+=Number(beatmap.counts.plays);
				}
			}
		totalPlaycount = totalPlaycount.toLocaleString("en-US");
		console.log("total playcount: "+totalPlaycount);

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
		let oldestRankedMap =new Date( Math.min(...rankedDateList));
		let newestRankedMap =new Date( Math.max(...rankedDateList));
		console.log("oldest map: "+oldestMap);
		console.log("newest map: "+newestMap);
		console.log("oldest ranked map: "+oldestRankedMap);
		console.log("newest ranked map: "+newestRankedMap);
		
		let mappingAgeUnix = new Date(new Date().getTime() - oldestMap.getTime());
		let mappingAge = parseDate(mappingAgeUnix);
		console.log("mapping age: "+mappingAge);
		console.log("mapset id 0: "+beatmaps[0].beatmapSetId);
		console.log(typeof beatmaps[0].beatmapSetId);
		let latestMapsetId = Math.max(...beatmapsets);
		console.log("latest map id: "+latestMapsetId);
		let latestMapset = beatmaps.find(beatmap => beatmap.beatmapSetId == latestMapsetId);
		let latestMapsetTitle = latestMapset.title;
		console.log("latest map title: "+latestMapsetTitle);
		let latestMapsetArtist = latestMapset.artist;
		console.log("latest map artist: "+latestMapsetArtist);

		let mapperURL = "https://osu.ppy.sh/users/"+mapperId;
		let latestMapsetURL = "https://osu.ppy.sh/beatmapsets/"+latestMapsetId;
		let imageCover = "https://assets.ppy.sh/beatmaps/"+latestMapsetId+"/covers/cover.jpg"
		let mapperPFP = "https://a.ppy.sh/"+mapperId;

		let embed = new MessageEmbed()
			.setTitle(mapperName)
			.setURL(mapperURL)
			.setColor(0x00AE86)
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