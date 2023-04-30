export function decimalToHexString(decimal: number) {
    if (decimal < 0) {
        decimal = 0xffffffff + decimal + 1;
    }

    return decimal.toString(16).toUpperCase();
}
