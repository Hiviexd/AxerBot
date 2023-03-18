import { existsSync, mkdirSync } from "fs";
import path from "path";

export function validateCacheFolder() {
    if (!existsSync(path.resolve("./cache")))
        mkdirSync(path.resolve("./cache"));

    return true;
}
