/**
 * ? convert a `days` duration to a `year, days` duration
 */
export default function calculateDuration(days: number): string {
    let years = Math.floor(days / 365);
    let remainingDays = Math.round(days % 365);

    if (years > 0) {
        return `${years} ${years == 1 ? 'year' : 'years'}, ${remainingDays} days`;
    } else {
        return `${remainingDays} days`;
    }
}
