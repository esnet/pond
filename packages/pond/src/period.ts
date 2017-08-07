/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as Immutable from "immutable";
import * as _ from "lodash";
import * as moment from "moment";

import { Duration, duration } from "./duration";
import { Index } from "./index";
import { Time } from "./time";
import { TimeRange } from "./timerange";

export enum PeriodType {
    Day = 1,
    Month,
    Year,
    Duration
}

/**
 * A period is a repeating unit of time which is typically
 * used in pond to describe an aggregation bucket. For example
 * a `period("1d")` would indicate buckets that are a day long.
 */
export class Period {
    private _type: PeriodType;
    private _frequency: Duration;
    private _length: Duration;
    private _offset: number;

    /**
     * A Period is a reoccuring duration of time, for example: "every day", or
     * "1 hour, repeated every 5 minutes".
     *
     * A Period can be made in two ways. The first is a "Calendar" based `Period`.
     * You construct one of these by providing the appropiate PeriodType:
     *  * "Day"
     *  * "Month"
     *  * "Year"
     *
     * The second is a "Duration" based `Period`s. An example might be to repeat a
     * 5 minute interval every 10 second, starting at some beginning time.
     *
     * To define an duration `Period`, you need to specify up to three parts:
     *
     *  * the `stride` of the period which is how often the beginning of the
     *    duration of time repeats itself. This is a `Duration`, i.e. the duration
     *    of the length of the stride, or basically the length between the beginning
     *    of each period repeat. In the above example that would be `duration("10s")`.
     *  * the `length` of the period, which is the range of time forward of the
     *    repeating beginning time of the period, which defaults to the stride.
     *    This is a `Duration`. In the above example that would be `duration("5m")`.
     *  * the `offset`, a point in time to calculate the period from, which defaults
     *    to Jan 1, 1970 UTC or timestamp 0. This is specified as a `Time`.
     *
     * Repeats of the period are given an index to represent that specific repeat.
     * That index is represented by an `Index` object and can also be represented
     * by a string that encodes the specific repeat.
     *
     * Since an `Index` can be a key for a `TimeSeries`, a repeated period and
     * associated data can be represented.
     *
     * ```
     * |<- offset ->|<- length ----->|   |<-- stride
     *              |                    |   |<-- stride
     *              [----------------]       |   |
     *                  [----------------]
     *                      [----------------]  <-- each repeat has an Index
     *                          [----------------]
     *                                ...
     * ```
     *
     */
    constructor(type: PeriodType, frequency?: Duration, length?: Duration, offset?: Time) {
        this._type = type;
        if (type === PeriodType.Duration) {
            if (!frequency) {
                throw new Error("Expected frequency to be supplied to Period constructor");
            }
            this._frequency = frequency;
            this._length = length || frequency;
            this._offset = offset ? offset.timestamp().getTime() : 0;
        }
    }

    /**
     * Returns the period repeats that cover (in whole or in part)
     * the time or timerange supplied. In this example, B, C, D and E
     * will be returned. Each repeat is returned as an `Index`:
     * ```
     *                    t (Time)
     *                    |
     *  [----------------]|                    A
     *      [-------------|--]                 B
     *          [---------|------]             C
     *              [-----|----------]         D
     *                  [-|--------------]     E
     *                    | [----------------] F
     * ```
     *
     */
    getIndexSet(t: Time | TimeRange): Immutable.OrderedSet<Index> {
        let t1;
        let t2;
        if (t instanceof Time) {
            t1 = t;
            t2 = t;
        } else if (t instanceof TimeRange) {
            t1 = t.begin();
            t2 = t.end();
        }
        console.log("t1, t2", t1, t2);
        let result = Immutable.OrderedSet<Index>();
        if (this._type === PeriodType.Duration) {
            let prefix = `${this._frequency}`;
            if (this._length && this._length !== this._frequency) {
                prefix += `:${this._length}`;
            }
            if (this._offset) {
                prefix += `+${this._offset}`;
            }
            console.log("prefix", prefix);

            const scanBegin = +t1 - +this._length;
            let periodIndex = Math.ceil(scanBegin / +this._frequency);
            const indexes = [];
            console.log("X", this._length, +this._frequency, this._frequency);
            while (periodIndex * +this._frequency < +t2) {
                result = result.add(new Index(`${prefix}-${periodIndex}`));
                periodIndex += 1;
            }
        }
        console.log("-->", result);
        return result;
    }
}

function period(frequency?: Duration, length?: Duration, offset?: Time): Period {
    return new Period(PeriodType.Duration, frequency, length, offset);
}
function daily() {
    return new Period(PeriodType.Day);
}
function monthly() {
    return new Period(PeriodType.Month);
}
function yearly() {
    return new Period(PeriodType.Year);
}

export { period, daily, monthly, yearly };
