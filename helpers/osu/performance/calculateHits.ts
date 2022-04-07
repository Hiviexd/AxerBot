import Accuracy from "./Accuracy";

export default (acc: number, max_combo: number) => {
	const accuracy = new Accuracy({
		nobjects: max_combo,
		percent: acc,
		nmiss: 0,
	});

	return {
		n300: accuracy.n300,
		n100: Math.abs(accuracy.n100),
	};
};
