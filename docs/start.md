## Getting started

Pond will run in node.js or in the browser. Install from npm:

```cmdline
npm install @esnet/pond --save
```

### Client

While Pond is written in ES6 the npm dist is transpiled to ES5 so it should run anywhere. To use in a browser you will need to install it with npm and and build your source with Webpack or something similar.

### Server

On the server, it's best to use babel-node, though straight up node will generally work too.

Here's a simple example:

    import {Index, TimeSeries} from "@esnet/pond";

    //Index example
    let index = new Index("1d-12345");
    console.log(index.asTimerange().humanize());

    //Timeseries example
    const data = {
        "name": "traffic",
        "columns": ["time", "value", "status"],
        "points": [
            [1400425947000, 52, "ok"],
            [1400425948000, 18, "ok"],
            [1400425949000, 26, "fail"],
            [1400425950000, 93, "offline"],
        ]
    };

    let series = new TimeSeries(data);
    for (let i=0; i < series.size(); i++) {
        console.log(series.at(i).toString());
    }
