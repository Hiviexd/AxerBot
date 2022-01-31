//simple thing to test randomDate
function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

console.log(randomDate(new Date(2020, 0, 1), new Date(2020, 0, 31)));