// ? This will remove all metadata decorators from a string, like (Cut Ver.) or (TV Size)

export default (text: string) => {
	const DECORATOR_REGEX = /\([a-zA-Z]+ [a-zA-Z]+\)/g;

	text = text.replace(DECORATOR_REGEX, "");

	return text.trim();
};
