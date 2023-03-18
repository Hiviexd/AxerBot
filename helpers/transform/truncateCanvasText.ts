import { CanvasRenderingContext2D } from "canvas";

export function truncateCanvasText(
    c: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
) {
    var width = c.measureText(text).width;
    var ellipsis = "…";
    var ellipsisWidth = c.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
        return text;
    } else {
        var len = text.length;
        while (width >= maxWidth - ellipsisWidth && len-- > 0) {
            text = text.substring(0, len);
            width = c.measureText(text).width;
        }
        return text + ellipsis;
    }
}
