declare const describe: any;
declare const it: any;
declare const expect: any;

import TimeRange from "../src/timerange";
import * as moment from "moment";
import Moment = moment.Moment;

const fmt = "YYYY-MM-DD HH:mm";

describe("TimeRange", () => {
    it("can create a new range with a begin and end time", () => {
        const beginTime = moment("2012-01-11 11:11", fmt).toDate();
        const endTime = moment("2012-02-22 12:12", fmt).toDate();
        const range = new TimeRange(beginTime, endTime);
        expect(range.begin().getTime()).toBe(beginTime.getTime());
        expect(range.end().getTime()).toBe(endTime.getTime());
    });


});
