import { createCanvas, loadImage } from "canvas";
import { Chart } from "chart.js";
import { User, UserBadge } from "../../../types/user";
import jimp from "jimp";
import axios from "axios";
import Jimp from "jimp";
import hexToRgb from "./hexToRgb";

export default async (user: User, color: string): Promise<any> => {
	const canvas = createCanvas(1320, 240);
	const ctx = canvas.getContext("2d");

	if (!user.rank_history?.data || !user.statistics)
		return canvas.toBuffer("image/png"); // ? Return a blank canvas

	const raw = user.rank_history?.data ?? [];
	const parsed_raw = raw.map((rank, i) => -rank).filter((point) => point < 0);

	if (parsed_raw.length > 0) {
		if (parsed_raw.length === 1) {
			parsed_raw.unshift(parsed_raw[0]);
		}

		parsed_raw.push(-user.statistics.global_rank);
	}

	const labels: any = new Array(parsed_raw.length).fill("");
	const myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Rank",
					fill: false,
					data: parsed_raw,
					borderColor: color,
					borderWidth: 7,
					pointRadius: 0,
					pointBackgroundColor: "rgb(255, 206, 0)",
					backgroundColor: hexToRgb(color),
					tension: 0.1,
				},
			],
		},
		options: {
			plugins: {
				legend: {
					position: "top",
					display: false,
				},
				title: {
					display: true,
				},
			},
			scales: {
				x: {
					grid: {
						display: false,
					},
				},
				y: {
					display: true,
					grid: {
						display: true,
						color: "#777777",
					},
					ticks: {
						font: {
							size: 32,
						},
						color: "#ffffff",
						stepSize: 1,
						padding: 3,
						callback: function (
							label: any,
							index: any,
							labels: any
						) {
							return `#${Math.abs(label)}`;
						},
					},
				},
			},

			// options: {
			// 	scales: {
			// 		ticks: {
			// 			display: false,
			// 		},
			// 		y: {
			// 			display: true,
			// 			grid: {
			// 				display: false,
			// 			},
			// 			ticks: {
			// 				font: {
			// 					size: 35,
			// 				},
			// 				color: "#ffffff",
			// 				callback: function (value: any) {
			// 					var x = ["a", "b", "c"];

			// 					return x[value | 0];
			// 				},
			// 			},
			// 		},

			// 	ticks: {
			// 		display: false,
			// 		// color: "rgba(0,0,0,0)",
			// 		// font: {
			// 		//   size: 0.2,
			// 		//   lineHeight: 1.2,
			// 		// },
			// 	},
			// },
			// x: {
			// 	grid: {
			// 		display: false,
			// 	},
			// },

			// color: "rgba(0,0,0,0)",
			animation: {
				duration: 0,
			},
		},
	});

	myChart.draw();

	const container = await jimp.read(canvas.toBuffer("image/png"));
	container.resize(1350, 350);

	const chart = await jimp.read(canvas.toBuffer("image/png"));

	const banner = await jimp.read(
		String(user.cover.custom_url || getRandomDefaultBg())
	);

	const ratio = getCoverSize(
		banner.getWidth(),
		banner.getHeight(),
		1350,
		350
	);

	banner.resize(ratio.width, ratio.height);
	banner.brightness(-0.7);

	container.composite(
		banner,
		(1350 - banner.getWidth()) / 2,
		(350 - banner.getHeight()) / 2
	);

	container.composite(
		chart,
		(1350 - chart.getWidth()) / 2,
		(350 - chart.getHeight()) / 2 + 40
	);

	const badges = await generateBadges();
	container.composite(badges, (1350 - badges.getWidth()) / 2, 20);

	async function generateBadges() {
		let w = 0;
		let y = 10;

		const badges = await getBadges();
		const sanitizedBadges = [];

		for (let i = 0; i < 7; i++) {
			if (badges && badges.images[i]) {
				sanitizedBadges.push(badges.images[i]);
			}
		}

		sanitizedBadges.forEach((b) => {
			w += 142;
		});

		const badges_container = new jimp(w, 57);

		let x = 0;
		for (const badge of sanitizedBadges) {
			badge.image.resize(122, 57);
			badges_container.composite(badge.image, x, 0);
			x += 142;
		}

		return badges_container;
	}

	// const badges = await getBadges();

	// for (const b of badges.images) {
	// 	const img = await loadImage(
	// 		await b.image.getBufferAsync(jimp.MIME_PNG)
	// 	);

	// 	ctx.drawImage(img, b.x, b.y);
	// }

	// const chartCanvas = await loadImage(
	// 	await chart.getBufferAsync(jimp.MIME_PNG)
	// );

	// ctx.drawImage(
	// 	chartCanvas,
	// 	(canvas.width - canvas.width * 0.95) / 2,
	// 	(canvas.height - canvas.height * 0.7) / 2 + 30,
	// 	canvas.width * 0.95,
	// 	canvas.height * 0.7
	// );

	function getCoverSize(
		bgw: number,
		bgh: number,
		vw100: number,
		vh100: number
	) {
		/* projected background image size and position */

		const bgscale = Math.max(vh100 / bgh, vw100 / bgw);

		const projectedWidth = (bgw * bgscale) | 0;
		const projectedHeight = (bgh * bgscale) | 0;

		const leftOverflow = ((projectedWidth - vw100) / 2) | 0;
		const topOverflow = ((projectedHeight - vh100) / 2) | 0;

		return {
			width: projectedWidth + leftOverflow,
			height: projectedHeight + topOverflow,
		};
	}

	if (badges.getWidth() < 2) container.crop(1350, 100, 1350, 240);

	function getRandomDefaultBg() {
		const bgs = [1, 2, 3, 4, 5, 6, 7, 8];

		return `https://osu.ppy.sh/images/headers/profile-covers/c${
			bgs[Math.floor(Math.random() * bgs.length)]
		}.jpg`;
	}

	async function getBadges() {
		let x = 86;
		let y = 20;
		const r: { x: number; y: number; image: Jimp }[] = [];

		const clearBadges: UserBadge[] = [];

		for (let i = 0; i < 7; i++) {
			if (user.badges && user.badges[i]) {
				clearBadges.push(user.badges[i]);
			}
		}

		if (user.badges) {
			for (const b of clearBadges) {
				const img = await jimp.read(b.image_url);
				img.resize(img.getWidth() * 1.35, img.getHeight() * 1.35);

				r.push({
					x: x,
					y: y,
					image: img,
				});

				x += img.getWidth() + 10;
			}
		}

		return {
			images: r,
		};
	}

	return await container.getBufferAsync(jimp.MIME_PNG);
};
