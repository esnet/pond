## Rate (derivative)

This generates a new `TimeSeries` of `TimeRangeEvent` objects which contain the derivative between columns in two consecutive `Event` objects. The start and end time of the time range events correspond to the timestamps of the two events the calculation was derived from.

The primary use case for this was to generate rate data from monotonically increasing SNMP counter values like this:

```
    TimeSeries(RAW_COUNTERS).align(field_spec='in', window='30s').rate('in')
```
This would take the raw counter data, do a linear alignment on them on 30 second window boundaries, and then calculate the rates by calculating the derivative between the aligned boundaries.

However it is not necessary to align your events first, just calling `.rate()` will generate time range events with the derivative between the consecutive events.

### Usage

The method prototype:

```
    def rate(self, field_spec=null, allow_negative=True)
```
* `field_spec` - indicates which fields should be interpolated by the selected `method`. Typical usage of this arg type. If not supplied, then the default field `value` will be used.
* `allow_negative` - if left defaulting to `True`, then if a negative derivative is calculated, that will be used as the value in the new event. If set to `False` a negative derivative will be set to `null` instead. There are certain use cases - like if a monotonically increasing counter gets reset - that this is the desired outcome.