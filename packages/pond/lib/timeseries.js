"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * The TimeSeries wire format is the easiest way to construct a TimeSeries.
 * The most minimal version of this format looks like this:
 * ```
 * {
 *   "name": name,
 *   "columns": [keyName, column-1, ..., column-n]
 *   "points": [
 *      [t1, v1, v2, ..., v2],
 *      [t2, v1, v2, ..., vn],
 *      ...
 *   ]
 * }
 * ```
 */
/*
export interface ITimeSeriesWireFormat {
    name?: string;
    utc?: boolean;
    columns: number;
    points: any[];
    [propName: string]: any;
}
*/
/**
 * You can construct a TimeSeries with a list of Events, by passing in an
 * object containing a single property "events".
 *
 * ```
 * { "events": [event-1, event-2, ..., event-n]}
 * ```
 */
/*
export interface ITimeSeriesEvents<T extends Key, D extends Data> {
    events?: Array<Event<T, D>>;
    [propName: string]: any;
}

class TimeSeries<T extends Key, D extends Data> {

    private _collection: Collection<T, D> = null;
    private _data = null;

    constructor(arg: TimeSeries<T, D> | ITimeSeriesEvents<T, D> | ITimeSeriesWireFormat) {
        if (arg instanceof TimeSeries) {
            const other = arg as TimeSeries<T, D>;
            this._data = other._data;
            this._collection = other._collection;
        } else if (_.isObject(arg)) {
            //
            // TimeSeries(object data) where data may be:
            //    { "events": [event-1, event-2, ..., event-n]}
            // or
            //    { "columns": [time|timerange|index, column-1, ..., column-n]
            //      "points": [
            //         [t1, v1, v2, ..., v2],
            //         [t2, v1, v2, ..., vn],
            //         ...
            //      ]
            //    }
            if (_.has(arg, "events")) {
                const eventObj = arg as ITimeSeriesEvents<T, D>;
                const { events, ...meta1 } = arg;
                this._collection = new Collection<T>(events);
                this._data = buildMetaData(meta1);
            } else if (_.has(obj, "collection")) {
                //
                // Initialized from a Collection
                //
                const { collection, ...meta3 } = obj;
                this._collection = collection;
                this._data = buildMetaData(meta3);
            } else if (_.has(obj, "columns") && _.has(obj, "points")) {
                const wireFormat = obj as ITimeSeriesWireFormat;
                //
                // Initialized from the wire format
                //
                const { columns, points, utc = true, ...meta2 } = obj;
                const [eventKey, ...eventFields] = columns;
                const events = points.map(point => {
                    const [t, ...eventValues] = point;
                    const d = _.object(eventFields, eventValues);
                    const options = utc;
                    const Event = this.constructor.event(eventKey);
                    return new Event(t, d, options);
                });

                this._collection = new Collection(events);
                this._data = buildMetaData(meta2);
            }

            if (!this._collection.isChronological()) {
                throw new Error(
                    "TimeSeries was passed non-chronological events"
                );
            }
        }
    }
}

export default TimeSeries;
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lc2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7R0FRRzs7QUFRSDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVIOzs7Ozs7OztFQVFFO0FBRUY7Ozs7Ozs7R0FPRztBQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxRUUifQ==