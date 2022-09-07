import getEmoji from "./getEmoji";

export default (mode: string, starRating: number) => {
    mode === "fruits" ? mode = "catch" : mode;

    switch(true) {
        case starRating < 2:
            return getEmoji("easy" + mode[0]);
        case starRating < 2.7:
            return getEmoji("normal" + mode[0]);
        case starRating < 4:
            return getEmoji("hard" + mode[0]);
        case starRating < 5.3:
            return getEmoji("insane" + mode[0]);
        case starRating < 6.5:
            return getEmoji("expert" + mode[0]);
        case starRating < 8:
            return getEmoji("expertplus" + mode[0]);
        case starRating >= 8:
            return getEmoji("hell" + mode[0]);
        default:
            return getEmoji(mode);
    }
};
