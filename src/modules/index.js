import moment from "moment";

import TimeRange from "./range";

const units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60 * 60},
    "d": {"label": "days", "length": 60 * 60 * 24}
};

/**
 * An index that represents as a string a range of time.
 *
 * The actual derived timerange can be found using asRange(). This will return
 * a TimeRange instance.
 *
 * The original string representation can be found with toString().
 */
export default class Index {

    constructor(s) {
        this._s = s;
        this._r = this._rangeFromIndexString(s);
    }

    _rangeFromIndexString(s) {
        const parts = s.split("-");
        const size = parts[0];
        let length;

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

    toJSON() {
        return this._s;
    }

    toString() {
        return this._s;
    }

    // Alias for toString()
    asString() {
        return this.toString();
    }

    asTimerange() {
        return this._r;
    }
}
