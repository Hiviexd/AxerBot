import { createCanvas } from "canvas";
import { Chart } from "chart.js";
import { User } from "../../../types/user";

export default (user: User): any => {
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
					display: false,
				},
				title: {
					display: false,
				},
				subtitle: {
					display: false,
				},
			},
			color: "rgba(0,0,0,0)",
			animation: {
				duration: 0,
			},
		},
	});

	myChart.draw();

	return canvas.toBuffer("image/png");
};
