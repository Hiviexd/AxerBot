export default (string: string, size: number, ellipsis?: boolean) => {
    if (string.length <= size) return string;

    if (ellipsis) return string.slice(0, size - "...".length) + "...";

    return (
        string.slice(0, size - "... **[truncated]**".length) +
        "... **[truncated]**"
    );
};
