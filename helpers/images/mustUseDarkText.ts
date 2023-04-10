export function mustUseDarkText(red: number, green: number, blue: number) {
    var brightness;
    brightness = red * 299 + green * 587 + blue * 114;
    brightness = brightness / 255000;

    if (brightness >= 0.5) {
        return true;
    } else {
        return false;
    }
}
