import processText from "./processText";
export default async function randomMessage(source: any, privateState: number) {
    const data = await processText(source, privateState);
    let quotes = data;
    let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return randomQuote;
}