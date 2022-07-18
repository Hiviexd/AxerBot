import { createCanvas, loadImage } from "canvas";
import { Chart } from "chart.js";
import { User } from "../../../types/user";
import jimp from "jimp";
import axios from "axios";

export default async (user: User): Promise<any> => {
	const canvas = createCanvas(1280, 300);
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
					borderColor: "rgb(255, 206, 86, 0)",
					pointRadius: 0,
					borderWidth: 7,
					backgroundColor: "rgb(255, 206, 86)",
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
					display: false,
				},
			},
			scales: {
				ticks: {
					display: false,
				},
				y: {
					display: false,
					grid: {
						display: false,
					},
					ticks: {
						display: false,
						// color: "rgba(0,0,0,0)",
						// font: {
						//   size: 0.2,
						//   lineHeight: 1.2,
						// },
					},
				},
				x: {
					grid: {
						display: false,
					},
				},
			},
			// color: "rgba(0,0,0,0)",
			animation: {
				duration: 0,
			},
		},
	});

	myChart.draw();
	const chart = await jimp.read(canvas.toBuffer("image/png"));

	const banner = await jimp.read(
		String(user.cover.custom_url || getRandomDefaultBg())
	);

	const ratio = getCoverSize(
		banner.getWidth(),
		banner.getHeight(),
		1280,
		300
	);

	banner.resize(ratio.width, ratio.height);
	banner.brightness(-0.7);
	const bannerCanvas = await loadImage(
		await banner.getBufferAsync(jimp.MIME_PNG)
	);

	ctx.drawImage(
		bannerCanvas,
		(1280 - banner.getWidth()) / 2,
		(300 - banner.getHeight()) / 2,
		banner.getWidth(),
		banner.getHeight()
	);

	const chartCanvas = await loadImage(
		await chart.getBufferAsync(jimp.MIME_PNG)
	);

	ctx.drawImage(chartCanvas, (1280 - 1240) / 2, (300 - 260) / 2, 1240, 260);

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

	function getRandomDefaultBg() {
		const bgs = [1, 2, 3, 4, 5, 6, 7, 8];

		return `https://osu.ppy.sh/images/headers/profile-covers/c${
			bgs[Math.floor(Math.random() * bgs.length)]
		}.jpg`;
	}

	return await canvas.toBuffer("image/png");
};
