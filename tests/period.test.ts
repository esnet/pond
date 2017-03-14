declare const describe: any;
declare const it: any;
declare const expect: any;

import Period from "../src/period";

describe("Period", () => {

    it("can construct one with a string", () => {
        const period = new Period("1d");
        console.log("Period", +period);
        expect(+period).toBe(86400000);
    });

    it("can construct one with just a number of ms", () => {
        const period = new Period(3600);
        expect(+period).toBe(3600);
    });

    it("can construct one with a number and the units", () => {
        const period1 = new Period(1234);
        expect(+period1).toBe(1234);

        const period2 = new Period(30, "seconds");
        expect(+period2).toBe(30000);

        const period3 = new Period(5, "minutes");
        expect(+period3).toBe(300000);

        const period5 = new Period(24, "hours");
        expect(+period5).toBe(86400000);

        const period6 = new Period(2, "days");
        expect(+period6).toBe(172800000);

        const period7 = new Period(4, "weeks");
        expect(+period7).toBe(2419200000);
    });

});
