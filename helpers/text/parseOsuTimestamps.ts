export default (rawText: string) => {
    const TIMESTAMP = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;

    const timestamps = rawText.match(TIMESTAMP);

    if (!timestamps) return rawText;

    let parsed = rawText;

    for (const timestamp of timestamps) {
        const res = TIMESTAMP.exec(timestamp);

        if (res) {
            TIMESTAMP.lastIndex = 0;

            parsed = parsed.replace(
                timestamp,
                `[${timestamp.trim()}](${encodeURI(
                    `https://axer-url.vercel.app/api/edit?time=${res[1]}:${res[2]}:${res[3]}${
                        res[4] ? `${res[4]}` : ""
                    }`
                )})`.replace("-", "")
            );
        }
    }

    console.log(parsed);

    return parsed;
};
