import ffmpeg from "fluent-ffmpeg";
import path from "path";

export function getFfmpegInstance() {
    const f = ffmpeg();

    if (process.platform == "win32") {
        f.setFfmpegPath(path.resolve("./bin/ffmpeg.exe"));
    }

    return f;
}
