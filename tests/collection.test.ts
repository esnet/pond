declare const describe: any;
declare const it: any;
declare const expect: any;

import * as Immutable from "immutable";
import * as moment from "moment";
import Moment = moment.Moment;

import Event from "../src/event";
import Time from "../src/time";
import Index from "../src/indexed";
import Collection from "../src/collection";

describe("Collection", () => {
    it("make one by adding two events", () => {
        const timestamp1 = new Time("2015-04-22T03:30:00Z");
        const timestamp2 = new Time("2015-04-22T02:30:00Z");

        const e1 = new Event(timestamp1, { a: 5, b: 6 });
        const e2 = new Event(timestamp2, { a: 4, b: 2 });

        let collection = new Collection<Time>();
        collection = collection.addEvent(e1);
        collection = collection.addEvent(e2);
    });

    /*
            collection = collection.addEvent(eDup, e => {
                return new Event<Time>(
                    timestamp1,
                    { a: eDup.get("a") + e.get("a") });
            });
    
            console.log("atKey", collection.atKey(timestamp1));
    
            collection.forEach((e, k) => {
                console.log(" --", e, k);
            })
    
            const sorted = collection.sortByTime();
    
            sorted.forEach((e, k) => {
                //console.log(" ==", e, k);
            })
    
            const mapped = sorted.map(event => {
                return new Event(event.key(), { a: 55 });
            });
    
            mapped.forEach((e, k) => {
                //console.log(" //", e, k);
            })
    
            mapped.test();
    */
});
});
