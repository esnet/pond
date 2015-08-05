import moment from "moment";
import _ from "underscore";

import TimeRange from "./range";

const units = {
    "s": {"label": "seconds", "length": 1},
    "m": {"label": "minutes", "length": 60},
    "h": {"label": "hours", "length": 60 * 60},
    "d": {"label": "days", "length": 60 * 60 * 24}
};

/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 * or:
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 *
 * and return a TimeRange for that time. The TimeRange may be considered to be
 * local time or UTC time, depending on the utc flag passed in.
 */
export function rangeFromIndexString(index, utc) {
    const isUTC = !_.isUndefined(utc) ? utc : true;
    const parts = index.split("-");

    let beginTime;
    let endTime;

    console.log("!!!", isUTC, utc)

    switch (parts.length) {
        case 3:
            // A day, month and year e.g. 2014-10-24
            if (!_.isNaN(parseInt(parts[0])) && !_.isNaN(parseInt(parts[1])) && !_.isNaN(parseInt(parts[2]))) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                beginTime = isUTC ? moment.utc([year, month - 1, day]) :
                                    moment([year, month - 1, day]);
                endTime = isUTC ? moment.utc(beginTime).endOf("day") :
                                  moment(beginTime).endOf("day");
            }
        break;

        case 2:
            // Size should be two parts, a number and a letter if it's a range based index, e.g 1h-23478
            const rangeRegex = /([0-9]+)([smhd])/;
            const sizeParts = rangeRegex.exec(parts[0]);
            if (sizeParts && sizeParts.length >= 3 && !_.isNaN(parseInt(parts[1]))) {
                const pos = parseInt(parts[1], 10);
                const num = parseInt(sizeParts[1], 10);
                const unit = sizeParts[2];
                const length = num * units[unit].length * 1000;

                beginTime = isUTC ? moment.utc(pos * length) :
                                    moment(pos * length);
                endTime = isUTC ? moment.utc((pos + 1) * length) :
                                  moment((pos + 1) * length);

            // A month and year e.g 2015-09
            } else if (!_.isNaN(parseInt(parts[0])) && !_.isNaN(parseInt(parts[1]))) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                beginTime = isUTC ? moment.utc([year, month - 1]) :
                                    moment([year, month - 1]);
                endTime = isUTC ? moment.utc(beginTime).endOf("month") :
                                  moment(beginTime).endOf("month");
            }
        break;

        // A year e.g. 2015
        case 1:
            const year = parts[0];
            beginTime = isUTC ? moment.utc([year]) :
                                moment.utc([year]);
            endTime = isUTC ? moment.utc(beginTime).endOf("year") :
                              moment(beginTime).endOf("year");
        break;
    }

    console.log("           *", beginTime, endTime);

    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
        return new TimeRange(beginTime, endTime);
    } else {
        return undefined;
    }
}

/**
 * Returns a nice string for the index. If the index is of the form 1d-2345 then
 * just that string is returned (there's not nice way to put it), but if it
 * represents a day, month, or year (e.g. 2015-07) then a nice string like "July"
 * will be returned. It's also possible to pass in the format of the reply for
 * these types of strings. See moment's format naming conventions:
 * http://momentjs.com/docs/#/displaying/format/
 */
export function niceIndexString(index, format) {
    let t;

    const parts = index.split("-");
    switch (parts.length) {
        case 3:
            if (!_.isNaN(parseInt(parts[0])) && !_.isNaN(parseInt(parts[1])) && !_.isNaN(parseInt(parts[2]))) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                t = moment.utc([year, month - 1, day]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("MMMM Do YYYY");
                }

            }
        break;

        case 2:
            const rangeRegex = /([0-9]+)([smhd])/;
            const sizeParts = rangeRegex.exec(parts[0]);
            if (sizeParts && sizeParts.length >= 3 && !_.isNaN(parseInt(parts[1]))) {
                return index;
            } else if (!_.isNaN(parseInt(parts[0])) && !_.isNaN(parseInt(parts[1]))) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                t = moment.utc([year, month - 1]);
                if (format) {
                    return t.format(format);
                } else {
                    return t.format("MMMM");
                }
            }
        break;

        case 1:
            const year = parts[0];
            t = moment.utc([year]);
            if (format) {
                return t.format(format);
            } else {
                return t.format("YYYY");
            }
        break;
    }
    return index;
}
