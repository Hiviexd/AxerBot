import { Message } from "discord.js";
import BeatmapsetDiscussionEmbed from "../../../messages/osu/BeatmapsetDiscussionEmbed";
import osuApi from "../osuApi";

export default async (url: string, message: Message) => {
	const post_info = getPostId(url);

	if (post_info.post == "") return;

	const post = await osuApi.fetch.beatmapsetDiscussionPost(
		post_info.post,
		post_info.type
	);

	if (post.status != 200) return;

	function getPostId(url: string) {
		let url_object = url.split("/");
		url_object = url_object.filter((p) => p.trim() != "");

		let data = {
			post: "",
			target: "",
			type: "reply",
		};

		if (url_object.length == 8) {
			try {
				data.post = url_object[7];
				data.type = "first";
			} catch (e) {
				console.error(e);
			}
		} else {
			try {
				data.post = url_object[7];
				data.target = url_object[8];
			} catch (e) {
				console.error(e);
			}
		}

		return data;
	}

	function getTargetPost() {
		let d: any = {
			beatmapsets: [],
			discussions: [],
			posts: [],
		};

		if (post_info.target != "") {
			d["beatmapsets"] = post.data.beatmapsets;
			d["discussions"] = post.data.discussions;
			d["posts"] = post.data.posts.filter(
				(p) => p.id == Number(post_info.target)
			);

			return d;
		}

		return post.data;
	}

	BeatmapsetDiscussionEmbed.send(getTargetPost(), post.data, message);
};
