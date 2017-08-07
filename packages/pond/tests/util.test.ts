/** 
 *  Copyright (c) 2015-2017, The Regents of the University of California, 
 *  through Lawrence Berkeley National Laboratory (subject to receipt 
 *  of any required approvals from the U.S. Dept. of Energy). 
 *  All rights reserved. 
 * 
 *  This source code is licensed under the BSD-style license found in the 
 *  LICENSE file in the root directory of this source tree. 
 */

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import * as Immutable from "immutable";
import * as moment from "moment";

import Util from "../src/util";

it("can check a string to make sure its a valid index string", () => {
    expect(Util.isIndexString("5m-5002093")).toBe(true);
    expect(Util.isIndexString("5m:1h-5002093")).toBe(true);
    expect(Util.isIndexString("5002093")).toBe(false);
    expect(Util.isIndexString("bob")).toBe(false);
    expect(Util.isIndexString("5x-50020")).toBe(false);
    expect(Util.isIndexString("5d")).toBe(false);
    expect(Util.isIndexString("5d-")).toBe(false);
    expect(Util.isIndexString("5d-xxx")).toBe(false);
});

it("can convert an index string into a timeseries", () => {
    const timerange = Util.timeRangeFromIndexString("5m:1h-5002093", false);
    expect(8).toBe(8);
});
