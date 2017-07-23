declare const describe: any;
declare const it: any;
declare const expect: any;

import * as moment from "moment";
import { period } from "../src/period";

describe("Period", () => {
    it("can construct one with a string", () => {
        const p = period("1d");
        expect(+p).toBe(86400000);
    });

    it("can construct one with just a number of ms", () => {
        const p = period(3600);
        expect(+p).toBe(3600);
    });

    it("can construct one with a number and the units", () => {
        const period1 = period(1234);
        expect(+period1).toBe(1234);

        const period2 = period(30, "seconds");
        expect(+period2).toBe(30000);

        const period3 = period(5, "minutes");
        expect(+period3).toBe(300000);

        const period5 = period(24, "hours");
        expect(+period5).toBe(86400000);

        const period6 = period(2, "days");
        expect(+period6).toBe(172800000);

        const period7 = period(4, "weeks");
        expect(+period7).toBe(2419200000);
    });

    it("can construct one with a moment", () => {
        const m = moment.duration(24, "hours");
        const p = period(m);
        expect(+p).toBe(86400000);
    });

    it("can construct one with a moment style object", () => {
        const p = period({
            seconds: 2,
            minutes: 2,
            hours: 2,
            days: 2,
            weeks: 2,
            months: 2,
            years: 2
        });
        expect(+p).toBe(69732122000);
    });
});
