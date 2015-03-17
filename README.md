# timeseries

A library build on top of immutable.js to provide basic timeseries functionality within ESnet tools.

## Why

Because we use timeseries data all the time, especially on the client, but potentially on the server. We would like a library to do this is a consistent and immutable way.

### Example 1: we collect some timeseries data from the server and want to send it to the client. Perhaps the server is node.js.

- Pull the data from a database

	var ts = getDataFromDB();

- Put the data, as a string, in the server response:

	resp = ts.toString();

- Receive the data on the client:

    var ts = new Timeseries(data);

- Get the time range of the data:

	var range = ts.timeRange();

- See if the time range overlaps with an existing timerange:

	if (range.overlaps(cachedRange)) { ... }


## Time ranges

You create a Timerange to hold a begin and end time:

    var timerange = new Timeseries.TimeRange(begin, end);

# Tests

The library has Mocha tests. To run the tests, use:

    npm start

Then point your browser to:

    http://localhost:9500/webpack-dev-server/tests
