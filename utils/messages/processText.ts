/**
 * * ================ processText.ts
 * ? returns array from txt file
 */

 import fs from "fs";
 import readline from "readline";
 import fetch from "node-fetch";

 async function processLink(link: string) {
    let response = await fetch(link);
    let body = await response.text();
    let lines = body.split("\n");
    return lines;
 }
    
 
 async function processFile(dir: any) {
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
 export default function processText(source:any, privateState:number){
     switch(privateState){
            case 0:
                return processFile(source);
            case 1:
                return processLink(source);
            default:
                return processFile(source);
     }
 }