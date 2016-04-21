## Getting started

---

Pond will run in node.js or in the browser. Install from npm:

```cmdline
npm install pondjs --save
```

### Client

While Pond is written in ES6 the npm dist is transpiled to ES5 so it will run anywhere. To use it within a browser you will need to install it with npm and then build your source with Webpack, Browserify or something similar.

### Server

On the server, it's best to use babel-node, though straight up node will generally work too.

Here's a simple example, run with babel-node:

    import {Index, TimeSeries} from "pondjs";

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
