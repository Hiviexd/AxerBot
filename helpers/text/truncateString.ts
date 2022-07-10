export default (string: string, size: number) => {
	if (string.length <= size) return string;

	return (
		string.slice(0, size - "... **[truncated]**".length) + "... **[truncated]**"
	);
};
