export function integerToHex(integer: number) {
    const str = Number(integer).toString(16);
    return str.length == 1 ? "0" + str : str;
}

export function hexFromRGB(r: number, g: number, b: number) {
    return "#" + integerToHex(r) + integerToHex(g) + integerToHex(b);
}
