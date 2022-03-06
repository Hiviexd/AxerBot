/**
 * * ================ randomMessage.ts
 * ? picks a random text line from a .txt
 */

 import fs from "fs";
 import readline from "readline";
 
 export default async function processFile(dir: any) {
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
         //TODO: fetch lines as template literals instead of strings with quotes
         returnArray.push(line);
     }
 
     return returnArray;
 }