## Glossary
---

This guide contains a description of terms that are specific to Pond. Please let us know if there are terms in the API or documentation that need further explanation and we will update this document.

---
### Alignment

This refers to taking a sequence of data that may be irregular in timestamps and converting that to fall on specific time boundaries. For instance you could have data at 1:31, 2:01, 2:34, and 3:01 and would like to align this to exact 30s boundaries (1:30, 2:00, 2:30, and 3:00). Pond can do this with `TimeSeries.align()` or in a Pipeline, with a variety of options for how the incoming data is interpolated to the aligned output.

---
### Collapsing

This is the process of taking multiple columns of data and turning it into a single column.

---
### Fields: fieldSpec and fieldPath

There are some points to note about the nomenclature that the `pypond` and `pond` code bases use to refer to the "columns of data" in the time series event objects. This `TimeSeries`:

```
const DATA = {
    name: "traffic",
    columns: ["time", "value", "status"],
    points: [
        [1400425947000, 52, "ok"],
        [1400425948000, 18, "ok"],
        [1400425949000, 26, "fail"],
        [1400425950000, 93, "offline"]
    ]
};
```

contains two **columns**: `value` and `status`.

However this `TimeSeries`:

```
const DATA_FLOW = {
    name: "traffic",
    columns: ["time", "direction"],
    points: [
        [1400425947000, {'in': 1, 'out': 2}],
        [1400425948000, {'in': 3, 'out': 4}],
        [1400425949000, {'in': 5, 'out': 6}],
        [1400425950000, {'in': 7, 'out': 8}]
    ]
};
```

contains only one column `direction`, but that column has two more columns - `in` and `out` - nested under it. In the following examples, these nested columns will be referred to as **deep paths**.

When specifying columns to the methods that set, retrieve and manipulate data, we use two argument types: `fieldSpec` and `fieldPath`. They are similar yet different enough to warrant this document.

#### fieldPath

A `fieldPath` refers to a **single** column in a series. Any method that takes a `fieldPath` as an argument only acts on one column at a time. The value passed to this argument can be either a string, an array or `null`.

##### String variant

When a string is passed, it can be one of the following formats:

 * simple path - the name of a single "top level" column. In the `DATA` example above, this would be either `value` or `status`.
 * deep path - the path pointing to a single nested columns with each "segment" of the path delimited with a period. In the `DATA_FLOW` example above, the incoming data could be retrieved with `direction.in` as the `fieldPath`.

##### List variant

When a array is passed as a `fieldPath`, each element in the array is **a single segment of the path to a column**. So to compare with the string examples:

 * `['value']` would be equivalent to the string `value`.
 * `['direction', 'in']` would be equivalent to the string `direction.in`.

This is particularly important to note because **this behavior is different** than passing a list to a `fieldSpec` arg.

##### `None`

If no `fieldPath` is specified (defaulting to `null`), then the default column `value` will be used.

#### fieldSpec

A `fieldSpec` refers to **one or more** columns in a series. When a method takes a `fieldSpec`, it may act on multiple columns in a `TimeSeries`. The value passed to this argument can be either a string, an array or `null`.

##### String variant

The string variant is essentially identical to the `fieldPath` string variant - it is a path to a single column of one of the following formats:

 * simple path - the name of a single "top level" column. In the `DATA` example above, this would be either `value` or `status`.
 * deep path - the path pointing to a single nested columns with each "segment" of the path delimited with a period. In the `DATA_FLOW` example above, the incoming data could be retrieved with `direction.in` as the `fieldSpec`.

##### List variant

Passing a array to `fieldSpec` is different than the aforementioned behavior in that it is explicitly referring to **one or more columns**. Rather than each element being segments of a path, **each element is a full path to a single column**.

Using the previous examples:

 * `['in', 'out']` would act on both the `in` and `out` columns from the `DATA` example.
 * `['direction.in', 'direction.out']` - here each element is a fully formed "deep path" to the two data columns in the `DATA_FLOW` example.

The lists do not have to have more than one element: `['value'] == 'value'`.

NOTE: accidentally passing this style of list to an arg that is actually a `fieldPath` will most likely result in an error. Passing something like `['in', 'out']` as a `fieldPath` will attempt to retrieve the nested column `in.out` which probably doesn't exist.

##### `None`

If no `fieldSpec` is specified (defaulting to `null`), then the default column `value` will be used.

#### fieldSpecList

This is a less common variant of the `fieldSpec`. It is used in the case where the method is going to **specifically act on multiple columns**, such as `TimeSeries.collapse()`, where an array is expected. Therefore its usage is identical to the array variant of `fieldSpec`.

---
### Index

Pond refers to certain standard time ranges, such as a particular hour, using an index. An index consists of two parts: a period such as "this refers to a 6 hour period", described with a string as "6h", and a position, which is a number that describes which 6 hour period in history we are referring to. An index such as "6h-1234" would be the 1234th 6hr period from the UNIX epoch (Jan 1st, 1970, UTC time). This string is typically referred to as an "Index String". This is distinct from an Index, which is an object wrapping of this string to allow easier handling of the index.

---
### Missing values

In pond, a missing value is a `null`, `undefined` or `NaN`. That is distinct from a point on a TimeSeries that doesn't exist at all. You can use `fill()` to fill in missing values, while you might use `align()` to add new points where points where expected but non-existent.

Additionally, if you are aggregating over a `Collection` or `TimeSeries`, you can supply filter functions that will treat missing values in a variety of ways.

---
### Pipeline

This is Pond's main processing mechanism. It is an event based system that can process either streaming events, or batch process bounded collections of events such as a TimeSeries.

---
### Processor

A node generated internally in a Pipeline. These nodes take events in and produce events out. You don't work with Processors directly. Instead you use the chainable methods on the Pipeline.

---
### Roll-ups

We use the term roll-up when building summary TimeSeries. An example would be turning 30 second measurement data into a TimeSeries of 5 minute average summaries.

You can perform common roll-ups directly on a TimeSeries, or as part of a Pipeline.

