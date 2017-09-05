declare const describe: any;
declare const it: any;
declare const expect: any;

import * as moment from "moment";
import { duration } from "../src/duration";
import { period, Period } from "../src/period";
import { time } from "../src/time";
import { timerange } from "../src/timerange";

import Util from "../src/util";

describe("Period", () => {
    it("can construct a period", () => {
        const p = period().every(duration("5m")).offsetBy(time(0));
    });

    it("can determine if a time is aligned to a period", () => {
        const p = period().every(duration("5m"));
        const isAligned = p.isAligned(time("2017-07-21T09:35:00.000Z"));
        const isNotAligned = p.isAligned(time("2017-07-21T09:33:00.000Z"));
        expect(isAligned).toBeTruthy();
        expect(isNotAligned).toBeFalsy();
    });

    it("can determine if a time is aligned to a period that has an offset", () => {
        const p = period().every(duration("5m")).offsetBy(time("2017-07-21T09:38:00.000Z"));
        const isAligned = p.isAligned(time("2017-07-21T09:43:00.000Z"));
        expect(isAligned).toBeTruthy();
    });

    it("can find the next time on the period", () => {
        const p = period().every(duration("5m")).offsetBy(time("2017-07-21T09:38:00.000Z"));
        const t = p.next(time("2017-07-21T09:49:00.000Z"));
        expect(+t).toBe(1500630780000); //2017-07-21T09:53:00.000Z
        const t2 = p.next(t);
        expect(+t2).toBe(1500631080000); // 2017-07-21T09:58:00.000Z
    });

    it("can find the list of times aligned to a period within a timerange", () => {
        const everyFiveMinutes = period().every(duration("5m"));
        const range = timerange(time("2017-07-21T09:30:00.000Z"), time("2017-07-21T09:45:00.000Z"));
        const result = everyFiveMinutes.within(range);

        expect(+result.get(0)).toBe(1500629400000); // 2017-07-21 9:30am
        expect(+result.get(1)).toBe(1500629700000); // 2017-07-21 9:35am
        expect(+result.get(2)).toBe(1500630000000); // 2017-07-21 9:40am
        expect(+result.get(3)).toBe(1500630300000); // 2017-07-21 9:45am
    });

    it("can find the list of times aligned to a period with offset within a timerange", () => {
        const everyFiveMinutes = period()
            .every(duration("5m"))
            .offsetBy(time("2017-07-21T09:38:00.000Z"));
        const result = everyFiveMinutes.within(
            timerange(time("2017-07-21T09:30:00.000Z"), time("2017-07-21T09:45:00.000Z"))
        );
        expect(+result.get(0)).toBe(1500629580000); // 2017-07-21 9:33am
        expect(+result.get(1)).toBe(1500629880000); // 2017-07-21 9:38am
        expect(+result.get(2)).toBe(1500630180000); // 2017-07-21 9:43am
    });

    it("can find the list of times aligned to a period within a timerange (begin aligned)", () => {
        const everyFiveMinutes = period()
            .every(duration("5m"))
            .offsetBy(time("2017-07-21T09:38:00.000Z"));
        const result = everyFiveMinutes.within(
            timerange(time("2017-07-21T09:38:00.000Z"), time("2017-07-21T09:45:00.000Z"))
        );
        expect(+result.get(0)).toBe(1500629880000); // 2017-07-21 9:38am
        expect(+result.get(1)).toBe(1500630180000); // 2017-07-21 9:43am
    });

    it("can find the list of times aligned to a period within a timerange (end aligned)", () => {
        const everyFiveMinutes = period()
            .every(duration("5m"))
            .offsetBy(time("2017-07-21T09:38:00.000Z"));
        const result = everyFiveMinutes.within(
            timerange(time("2017-07-21T09:38:00.000Z"), time("2017-07-21T09:43:00.000Z"))
        );
        expect(+result.get(0)).toBe(1500629880000); // 2017-07-21 9:38am
        expect(+result.get(1)).toBe(1500630180000); // 2017-07-21 9:43am
    });
});
