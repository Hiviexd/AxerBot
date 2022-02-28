const { MessageEmbed } = require("discord.js");
const numeral = require("numeral");
const { getUserBeatmaps } = require("../functions/osu/getUserBeatmaps");

exports.run = async (bot, message, args) => {
	if (args.length < 1) {
		message.channel.send("you forgor to put a username :skull:");
		return;
	}

	let username = args.join("_");
	const beatmaps = await getUserBeatmaps(username);

	let embed = new MessageEmbed()
		.setTitle(beatmaps.user.username)
		.setURL(`https://osu.ppy.sh/u/${beatmaps.user.id}`)
		.setColor("#e7792b")
		.setThumbnail(`https://a.ppy.sh/${beatmaps.user.id}`)
		.addField("Mapping Since", beatmaps.user.mapping_since, false)
		.addField(
			"Mapset Count",
			"🗺️ " +
				beatmaps.size +
				"  ✅ " +
				beatmaps.ranked +
				"  ❤ " +
				beatmaps.loved +
				"  ❓" +
				beatmaps.pending,
			true
		)
		.addField(
			"Playcount & Favorites",
			(value =
				"▶ " +
				numeral(beatmaps.sets_play_count).format("1,0") +
				"  💖 " +
				numeral(beatmaps.sets_favourite_count).format("1,0")),
			true
		)
		.addField(
			"Latest Map",
			`[${beatmaps.most_recent.artist} - ${beatmaps.most_recent.title}](https://osu.ppy.sh/s/${beatmaps.most_recent.id})`,
			false
		)
		.setImage(beatmaps.most_recent.covers["cover@2x"])
		.setTimestamp();
	message.channel.send({ embeds: [embed] });
};

exports.help = {
	name: "mapper",
};
