// * Remove extra S from strings

export default (name: string) => {
	if (name.toLowerCase().endsWith("s") || name.toLowerCase().endsWith("x"))
		return `${name}'`;

	return `${name}'s`;
};
