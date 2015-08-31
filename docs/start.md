## Getting started

Pond will run in node.js or in the browser. Install from npm:

    npm install @esnet/pond --save

Currently Pond requires the use of the Babel runtime, since it has some generator code in it. We are reevaluating whether this is worth it. Below are instructions for getting Pond working in different environments.

### Server

On the server, it's best to use babel-node. Here's a simple example:

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
    for (let event of series.events()) {
        console.log(event.toString());
    }

### Client

On the browser you should use webpack or similar. Since Pond requires the babel runtime, you will need to install Babel.

    npm install -g babel

And then include the following line at the beginning of your application:

    import "babel/register";

For straight up node.js (rather than babel-node), it is possible to use Pond, you just need to include the babel runtime.

    npm install babel-runtime --save

After this you will need a single require line. The above ES6 code can be rewritten has follows:

    regeneratorRuntime = require("babel-runtime/regenerator").default;
    var Pond = require("@esnet/pond");

    var index = new Pond.Index("1d-12345");
    console.log(index.asTimerange().humanize());

    var data = {
        "name": "traffic",
        "columns": ["time", "value", "status"],
        "points": [
            [1400425947000, 52, "ok"],
            [1400425948000, 18, "ok"],
            [1400425949000, 26, "fail"],
            [1400425950000, 93, "offline"],
        ]
    };

    var series = new Pond.TimeSeries(data);

    for (var i=0; i < series.size(); i++) {
        console.log(series.at(i).toString());
    }

