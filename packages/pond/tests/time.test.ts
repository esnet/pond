declare const describe: any;
declare const it: any;
declare const expect: any;

import { duration } from "../src/duration";
import { now, time } from "../src/time";

import { TimeAlignment } from "../src/types";

describe("Time", () => {
    it("can construct", () => {
        const t = time(new Date());
        const a = time();
        expect(t).toBeDefined();
    });

    it("can construct with a Date and get the result as a string", () => {
        const d = new Date(1487965207752);
        const s = time(d).toString();
        expect(s).toBe('{"time":1487965207752}');
    });

    it("can construct with a timestamp and get the result as a string", () => {
        const t = time(1487965207752);
        const s = t.toString();
        expect(s).toBe('{"time":1487965207752}');
    });

    it("can get the type() of the Time", () => {
        const t = time(1487965207752);
        expect(t.type()).toBe("time");
    });

    it("can get the JSON representation of the Time", () => {
        const t = time(1487965207752);
        expect(t.toJSON()).toEqual({ time: 1487965207752 });
    });

    it("can express the time as a value", () => {
        const t = time(1487965207752);
        expect(+t).toBe(1487965207752);
    });

    it("can express the time as a string", () => {
        const t = time(1487965207752);
        expect(`${t}`).toBe('{"time":1487965207752}');
    });

    it("can get the begin() time", () => {
        const t = time(1487965207752);
        expect(t.begin().getTime()).toBe(1487965207752);
    });

    it("can get the end() time", () => {
        const t = time(1487965207752);
        expect(t.end().getTime()).toBe(1487965207752);
    });

    it("can get the timestamp() time", () => {
        const t = time(1487965207752);
        expect(t.timestamp().getTime()).toBe(1487965207752);
    });

    it("can get the time as a UTC string", () => {
        const t = time(1487965207752);
        const s = t.toUTCString();
        expect(s).toBe("Fri, 24 Feb 2017 19:40:07 GMT");
    });

    it("can create a TimeRange from the Time", () => {
        const t = time(1494272285137);

        const tr1 = t.toTimeRange(duration("1d"), TimeAlignment.Begin);
        expect(tr1.toJSON()).toEqual({ timerange: [1494272285137, 1494358685137] });
        expect(tr1.duration()).toBe(86400000);
        expect(+tr1.begin()).toBe(+t.timestamp());

        const tr2 = t.toTimeRange(duration("1d"), TimeAlignment.Middle);
        expect(tr2.toJSON()).toEqual({ timerange: [1494229085137, 1494315485137] });

        const tr3 = t.toTimeRange(duration("1d"), TimeAlignment.End);
        expect(tr3.toJSON()).toEqual({ timerange: [1494185885137, 1494272285137] });
    });
});
