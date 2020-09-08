import { format, getYear, formatDistanceToNow } from "date-fns";

export const SANITY_PROJECT_ID = 'bu5rnal5'

export const KEYBOARD = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13
}

export const colorTrans = ["WHITE", "BLACK", "YELLOW", "RED", "GREEN", "BLUE"];

// export const MAP_WIDTH = 4096;
// export const MAP_HEIGHT = 4096;
export const MAP_WIDTH = 5000;
export const MAP_HEIGHT = 5000;

// const mainFormat = "MMM dd yyyy – HH:mm"
// const mainFormat = "MMM dd – HH:mm"
const mainFormat = "MMM dd yyyy"


export const formattedDate = (start, end) => {
    if (!start) {
        return false;
    }
    const startDate = Date.parse(start);

    if (!startDate) {
        return false;
    }

    if (!end) {
        return format(startDate, mainFormat);
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

export const formattedChatDate = (start) => {
    const startDate = start ? start : Date.now();
    return format(startDate, "HH:mm:ss");
};