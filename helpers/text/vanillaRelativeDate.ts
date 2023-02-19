export function vanillaRelativeTime(d1: Date, d2: Date) {
    var units: { [key: string]: number } = {
        year: 24 * 60 * 60 * 1000 * 365,
        month: (24 * 60 * 60 * 1000 * 365) / 12,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000,
    };

    var rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    var elapsed = d1.valueOf() - d2.valueOf();

    // "Math.abs" accounts for both "past" & "future" scenarios
    for (var u in units)
        if (Math.abs(elapsed) > units[u] || u == "second")
            return rtf.format(Math.round(elapsed / units[u]), u as any); // We don't have types for RelativeTimeFormatUnit rn
}
