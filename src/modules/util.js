import moment from "moment";

import TimeRange from "./range";

const units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60 * 60},
    "d": {"label": "days", "length": 60 * 60 * 24}
};

/**
 * This function will take an index such as 1d-278 and
 * return a TimeRange for that time
 */
export function rangeFromIndexString(index) {
    let length;
    const parts = index.split("-");
    const size = parts[0];

    // Position should be an int
    const pos = parseInt(parts[1], 10);

    // Size should be two parts, a number and a letter
    const re = /([0-9]+)([smhd])/;
    const sizeParts = re.exec(size);
    if (sizeParts && sizeParts.length >= 3) {
        const num = parseInt(sizeParts[1], 10);
        const unit = sizeParts[2];
        length = num * units[unit].length * 1000;
    }

    const beginTime = moment.utc(pos * length);
    const endTime = moment.utc((pos + 1) * length);

    return new TimeRange(beginTime, endTime);
}
