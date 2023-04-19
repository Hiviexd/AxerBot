export function arrayOnce<ArrayType = any[]>(
    keyFn: (item: ArrayType) => void,
    array: ArrayType[]
) {
    const mySet = new Set();
    return array.filter(function (x) {
        const key = keyFn(x),
            isNew = !mySet.has(key);
        if (isNew) mySet.add(key);

        return isNew;
    });
}
