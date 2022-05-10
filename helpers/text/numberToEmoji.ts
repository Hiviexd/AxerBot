/**
 * * ================ numberToEmoji.ts
 * ? Converts a regular number to one constructed with emojis
 */
let numberList = ['0⃣', '1⃣','2⃣', '3⃣', '4⃣', '5⃣','6⃣', '7⃣', '8⃣', '9⃣'];
export function numberToEmoji(counter: number): String {
    let result: String = "";
    counter.toString().split("").map((num: string) => {
        result += numberList[Number(num)];
    }).join("");
    return result;
}
