declare const describe: any;
declare const it: any;
declare const expect: any;

import * as moment from "moment";

import { duration } from "../src/duration";
import { period } from "../src/period";
import { window } from "../src/window";
import { time } from "../src/time";
import Util from "../src/util";

describe("Window", () => {
    it("can construct a window", () => {
        const window1 = window(duration("15m"), period(duration("5m")));

        console.log(window1);

        expect(+window1.duration()).toBe(900000);
        expect(+window1.period().frequency()).toBe(300000);
        expect(+window1.period().offset()).toBe(0);

        const window2 = window(duration("15m"))
            .every(duration("5m"))
            .offsetBy(time("2017-07-21T09:33:00.000Z"));

        expect(+window2.duration()).toBe(900000);
        expect(+window2.period().frequency()).toBe(300000);
        expect(+window2.period().offset()).toBe(1500629580000);
    });

    it("can find all the buckets that apply for a given time", () => {
        const slidingWindow = window(duration("15m"), period(duration("5m")));
        const indexSet = slidingWindow.getIndexSet(time("2017-07-21T09:38:00.000Z")).toList();
        console.log(indexSet.get(0).asString());
    });
});
