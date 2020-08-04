import { format, getYear } from "date-fns";

export const houseList = [
    { title: "CASE STUDY #1", x: 550, y: 1400 },
    { title: "CASE STUDY #2", x: 3500, y: 600 },
    { title: "CASE STUDY #3", x: 800, y: 3200 },
    { title: "CASE STUDY #4", x: 3100, y: 2100 },
    { title: "CASE STUDY #5", x: 1000, y: 3700 },
    { title: "CASE STUDY #6", x: 3500, y: 3800 },
    { title: "CASE STUDY #7", x: 3600, y: 2000 },
    { title: "CASE STUDY #8", x: 1000, y: 4500 }
];

export const KEYBOARD = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13
}

export const WIDTH = 5000;
export const HEIGHT = 5000;

export const formattedDate = (start, end) => {

    const startDate = start ? Date.parse(start) : Date.now();

    if (!end) {
        return format(startDate, "HH:mm:ss");
    }

    const endDate = Date.parse(end);

    if (format(startDate, "dd.MM.yyyy") == format(endDate, "dd.MM.yyyy")) {
        return format(startDate, "dd.MM.yyyy");
    }

    const startFormat =
        getYear(startDate) == getYear(endDate) ? "dd.MM" : "dd.MM.yyyy";
    const endFormat = "dd.MM.yyyy";

    return format(startDate, startFormat) + " – " + format(endDate, endFormat);
};
