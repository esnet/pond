declare const describe: any;
declare const it: any;
declare const expect: any;

import * as moment from "moment";
import { duration } from "../src/duration";

describe("Duration", () => {
    it("can construct one with a string", () => {
        const p = duration("1d");
        expect(+p).toBe(86400000);
    });

    it("can construct one with just a number of ms", () => {
        const p = duration(3600);
        expect(+p).toBe(3600);
    });

    it("can construct one with a number and the units", () => {
        const duration1 = duration(1234);
        expect(+duration1).toBe(1234);

        const duration2 = duration(30, "seconds");
        expect(+duration2).toBe(30000);

        const duration3 = duration(5, "minutes");
        expect(+duration3).toBe(300000);

        const duration5 = duration(24, "hours");
        expect(+duration5).toBe(86400000);

        const duration6 = duration(2, "days");
        expect(+duration6).toBe(172800000);

        const duration7 = duration(4, "weeks");
        expect(+duration7).toBe(2419200000);
    });

    it("can construct one with a moment", () => {
        const p = duration(moment.duration(24, "hours"));
        expect(+p).toBe(86400000);
    });

    it("can construct one with a moment style object", () => {
        const p = duration({
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
