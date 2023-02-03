/**
 * Fallback index to 0 if recive -1
 */

export function validateArrayIndex(index: number) {
	if (index == -1) return 0;

	return index;
}
