# Handling missing data

Real world data can have gaps, bad names, or occur at irregular intervals. Pond.js contains several methods to adjust or sanitize a series of less than optimal data. As with all other mutation operations in pond.js, these methods will return new `Event` objects, new `Collections` and new `TimeSeries` as apropos.

## Filling

Data might contain missing or otherwise invalid values. `TimeSeries.fill()` can perform a variety of fill operations to smooth or make sure that the data can be processed in math operations without blowing up.

In pond.js, a value is considered "invalid" if it `undefined`, `null` or `NaN`. In PyPond `None`, a `NaN` value, or an empty string are considered missing.

### Usage

The `fill()` method on a TimeSeries takes a single `options` argument. Options are:
* `fieldSpec` - is the same as it is in the rest of the code - a string or list of strings denoting "columns" in the data. It can point `to.deep.values` using the usual dot notation.
* `method` - denotes the fill or interpolation method to use. Valid values are **zero**, **pad** and **linear**.
* `limit` - a limit on the number of events that will be filled and returned in the new `TimeSeries`. The default is to fill all the events with no limit.

A complete sample usage could look like this:

```
    const ts = new TimeSeries(data);

    const filled = ts.fill({
        fieldSpec: ['direction.in', 'direction.out'],
        method: "linear",
        limit=6
    });
```

#### The method option

There are three fill methods:

* `zero` - the default - will transform any invalid value to a zero.
* `pad` - replaces an invalid value with the the previous good value: `[1, null, null, 3]` becomes `[1, 1, 1, 3]`.
* `linear` - interpolate the gaps based on the surrounding good values: `[1, null, null, null, 3]` becomes `[1, 1.5, 2, 2.5, 3]`.

Note: neither `pad` or `linear` can fill the first value in a series if it is invalid, and they can't start filling until good value has been seen: `[null, null, null, 1, 2, 3]` would remain unchanged. Similarly, `linear` can not fill the last value in a series.

#### The `limit` option

The optional `limit` controls how many values will be filled before it gives up and starts returning the invalid data until a valid value is seen again.

There might be a situation where it makes sense to fill in a couple of missing values, but no sense to pad out long spans of missing data. This options sets the limit of the number of missing values that will be filled - or in the case of `linear` *attempt* to be filled - before it just starts returning invalid data until the next valid value is seen.

So given `limit: 2` the following values will be filled in the following ways:

```
Original:
    [1, null, null, null, 5, 6, 7]

Zero:
    [1, 0, 0, null, 5, 6, 7]

Pad:
    [1, 1, 1, null, 5, 6, 7]

Linear:
    [1, null, null, null, 5, 6, 7]
```

Using methods `zero` and `pad` the first two missing values are filled and the third is skipped. When using the `linear` method, nothing gets filled because a valid value has not been seen before the limit has been reached, so it just gives up and returns the missing data.

When filling multiple columns, the count is maintained on a per-column basis.  So given the following data:

```
    const date = {
        name: "traffic",
        columns: ["time", "direction"],
        points: [
            [1400425947000, {"in": 1, "out": null}],
            [1400425948000, {"in": null, "out": null}],
            [1400425949000, {"in": null, "out": null}],
            [1400425950000, {"in": 3, "out": 8}],
            [1400425960000, {"in": null, "out": null}],
            [1400425970000, {"in": null, "out": 12}],
            [1400425980000, {"in": null, "out": 13}],
            [1400425990000, {"in": 7, "out": null}],
            [1400426000000, {"in": 8, "out": null}],
            [1400426010000, {"in": 9, "out": null}],
            [1400426020000, {"in": 10, "out": null}],
        ]
    }
```

The `in` and `out` sub-columns will be counted and filled independently of each other.

If `limit` is not set, no limits will be placed on the fill and all values will be filled as apropos to the selected method.

#### Constructing `linear` fill `Pipeline` chains

`TimeSeries.fill()` will be the common entry point for the `Filler`, but a `Pipeline` can be constructed as well. Even though the default behavior of `TimeSeries.fill()` applies to all fill methods, the `linear` fill logic is somewhat different than the `zero` and `pad` methods. Note the following points when creating your own `method: 'linear'` processing chain.

* When constructing a `Pipeline` to do a `linear` fill on multiple columns, chain them together like this rather than passing in a `field_spec` that is a list of columns:
```
    const pipeline = Pipeline()
        .fromSource(ts)
        .fill({fieldSpec: "direction.in", method: "linear"})
        .fill(fieldSpec: "direction.out", method: "linear"})
        .toKeyedCollections()
```
* If a non numeric value is encountered when doing a `linear` fill, a console.warn will be issued and that column will not be processed.
* When using an unbounded input (like `Stream`), it is a best practice to set a limit using the optional `limit`. This will ensure events will continue being emitted if the data hits a long run of missing values.
* When using an streaming source, make sure to shut it down "cleanly" using `.stop()`. This will ensure `.flush()` is called so any unfilled cached events are emitted.

## Alignment of data

The align processor takes a `TimeSeries` of events that might come in with timestamps at uneven intervals and produces a new series of those points are aligned on precise time window boundaries.  A series containing four events with following timestamps:

```
0:40
1:05
1:45
2:10
```

Given a period of `1m` (every one minute), a new series with two events at the following times will be produced:

```
1:00
2:00
```

Only a series of `Event` objects can be aligned. `IndexedEvent` objects are basically already aligned and it makes no sense in the case of a `TimeRangeEvent`.

It should also be noted that the emitted/aligned event will only contain the fields that alignment was requested on. Which is to say if you have two columns, `in` and `out`, and only request to align the `in` column, the `out` value will not be contained in the emitted event.

### Usage

The full argument usage of the align method:

```
    const ts = TimeSeries(data)
    const aligned = ts.align({
        fieldSpec: ["in", "out"],
        period: "1m",
        method: "linear",
        limit: 2
    });
```

* `fieldSpec` - indicates which fields should be interpolated by the selected `method`. Typical usage of this option type. If not supplied, then the default field `value` will be used.
* `period` - an integer and the usual `s/m/h/d` notation like `1m`, `30s`, `6h`, etc. The emitted events will be emitted on the indicated boundaries. Due to the nature of the interpolation, one would want to use a window close to the frequency of the events. It would make little sense to set a window of `5h` on hourly data, etc.
* `method` - the interpolation method to be used: `linear` (the default) and `hold`.
* `limit` - sets a limit on the number of boundary interpolated events will be produced. If `limit: 2, period: '1m'` and two events come in at the following times:

```
0:45
3:15
```

That would normally produce events on three alignment boundaries `1:00, 2:00 and 3:00` and that exceeds the `limit` so those events will have `null` as a value instead of an interpolated value.

### Interpolation methods

#### Linear

This is the default method. It uses simple linear interpolation between values in `Event` objects to derive new values on to the alignment boundaries. Interpolation occurs between the last event before the boundary and the first point after. Interpolation can occur across multiple boundaries at once.

#### Hold

This is a much simpler method. It just fills the selected field(s) with the corresponding value from the previous event.

