export function parseOsuPathId(field: string) {
    if (field.startsWith("/u/")) return field.slice(3);
    if (field.startsWith("/users/")) return field.slice(7);
    if (field.startsWith("/b/")) return field.slice(3);
    if (field.startsWith("/s/")) return field.slice(3);
    if (field.startsWith("/beatmaps/")) return field.slice(10);
    if (field.startsWith("/beatmapsets/")) return field.slice(13);

    return field;
}
