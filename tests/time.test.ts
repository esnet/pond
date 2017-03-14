declare const describe: any;
declare const it: any;
declare const expect: any;

import Time from "../src/time";

describe("Time", () => {

    it("can construct", () => {
        const time = new Time(new Date());
        expect(time).toBeDefined();
    });

    it("can construct with a Date and get the result as a string", () => {
        const d = new Date(1487965207752);
        const time = new Time(d);
        const s = time.toString();
        expect(s).toBe("1487965207752");
    });

    it("can construct with a timestamp and get the result as a string", () => {
        const time = new Time(1487965207752);
        const s = time.toString();
        expect(s).toBe("1487965207752");
    });

    it("can get the type() of the Time", () => {
        const time = new Time(1487965207752);
        expect(time.type()).toBe("time");
    });

    it("can get the JSON representation of the Time", () => {
        const time = new Time(1487965207752);
        expect(time.toJSON()).toBe(1487965207752);
    });

    it("can express the time as a value", () => {
        const time = new Time(1487965207752);
        expect(+time).toBe(1487965207752);
    });

    it("can express the time as a string", () => {
        const time = new Time(1487965207752);
        expect(`${time}`).toBe("1487965207752");
    });

    it("can get the begin() time", () => {
        const time = new Time(1487965207752);
        expect(time.begin().getTime()).toBe(1487965207752);
    });

    it("can get the end() time", () => {
        const time = new Time(1487965207752);
        expect(time.end().getTime()).toBe(1487965207752);
    });

    it("can get the timestamp() time", () => {
        const time = new Time(1487965207752);
        expect(time.timestamp().getTime()).toBe(1487965207752);
    });

    it("can get the time as a UTC string", () => {
        const time = new Time(1487965207752);
        const s = time.toUTCString();
        expect(s).toBe("Fri, 24 Feb 2017 19:40:07 GMT");
    });

});
