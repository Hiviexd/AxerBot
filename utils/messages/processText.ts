/**
 * * ================ processText.ts
 * ? returns array from txt file
 */

import fs from "fs";
import readline from "readline";
import axios from "axios";    
 
export async function parseTextFile(dir: any) {
    const fileStream = fs.createReadStream(dir);
    const returnArray = [];
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: crlfDelay is to recognize all instances of CR LF
    // ('\r\n') in the .txt as a single line break.

    for await (const line of rl) {
        // Each line in the .txt will be successively available here as `line`.
        returnArray.push(line);
    }
    return returnArray;
}

export async function parseTextFileAttachment(url: string) {
    const req = await axios(url);
    const file = req.data;

    const res:string[] = file.split("\n");
    
    return res;
}