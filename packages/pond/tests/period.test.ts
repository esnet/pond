declare const describe: any;
declare const it: any;
declare const expect: any;

import * as moment from "moment";
import { duration } from "../src/duration";
import { Period, PeriodType } from "../src/period";
import { time } from "../src/time";
import Util from "../src/util";

describe("Period", () => {
    it("can construct a period", () => {
        const p = new Period(PeriodType.Duration, duration("5m"), duration("15m"));
        const indexes = p.getIndexSet(time("2017-07-21T09:33:00.000Z"));
        console.log(
            indexes.map(index => `${index.toString()}: ${index.asTimerange().toUTCString()}`)
        );
    });
});
