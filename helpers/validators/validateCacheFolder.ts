import { existsSync, mkdirSync } from "fs";
import path from "path";

export function validateCacheFolder() {
    if (!existsSync(path.resolve("./cache")))
        mkdirSync(path.resolve("./cache"));

    if (!existsSync(path.resolve("./cache/beatmapsets/")))
        mkdirSync(path.resolve("./cache/beatmapsets"));

    return true;
}
