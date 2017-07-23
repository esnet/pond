import React, {Component} from 'react';

class Home extends Component {
  render() {
    const style = {
      borderLeftColor: "#9CDAE9",
      background: "#F8F9FA",
      borderLeft: "solid 3px #ECEAE9",
      boxSizing: "border-box",
      display: "block",
      fontSize: "0.875em",
      margin: ".5rem 0",
      overflowY: "scroll",
      padding: ".5rem 8px .5rem 12px",
      whiteSpace: "pre"
    };

    const textStyle = {
      color: "#626466",
      fontFamily: "'Fira Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      fontSize: 16,
      lineHeight: 2
    };

    const groupStyle = {
      color: "#333",
      // fontSize: 12,
      fontSize: "1.5em",
      fontWeight: 700,
      margin: "1.5rem 0 1.5rem"
    };

    return (
      <div style={textStyle}>
        <h3 style={groupStyle}>Introduction</h3>
        <p style={textStyle}> 
            Pond.js is a library built on top of immutable.js to provide time-based data structures, serialization and processing within our tools.<br />
            For data structures it unifies the use of time ranges, events and collections and time series. For processing it provides a chained pipeline interface to aggregate, collect and process batches or streams of events.<br />
            We are still developing Pond.js as it integrates further into our code, so it may change or be incomplete in parts. That said, it has a growing collection of tests and we will strive not to break those without careful consideration.
        </p>
        <h3 style={groupStyle}>Rationale</h3>
        <p>
            ESnet runs a large research network for the US Department of Energy. Our tools consume events and time series data throughout our network visualization applications and data processing chains. As our tool set grew, so did our need to build a Javascript 
            library to work with this type of data that was consistent and dependable. The alternative for us has been to pass ad-hoc data structures between the server and the client, making all elements of the system much more complicated. Not only do we need to deal 
            with different formats at all layers of the system, we also repeat our processing code over and over. Pond.js was built to address these pain points.
            The result might be as simple as comparing two time ranges:
        </p>
        <code style={style}>
            const timerange = timerange1.intersection(timerange2);
            timerange.asRelativeString();  // "a few seconds ago to a month ago"
        </code>
        <p>
          Or simply getting the average value in a timeseries:
        </p>
        <code style={style}>
          timeseries.avg("sensor");
        </code>
        <p>
          Or quickly performing aggregations on a timeseries:
        </p>
        <code style={style}>
          const timeseries = new TimeSeries(weatherData);
          {/*const dailyAvg = timeseries.fixedWindowRollup("1d", {value= avg});*/}
        </code>
        <p>
          Or much higher level batch or stream processing using the Pipeline API:
        </p>
        <code style={style}>
          const p = Pipeline()
            .from(timeseries)
            .take(10)
            .groupBy(e => e.value() > 65 ? "high" : "low")
            .emitOn("flush")
            {/*.to(CollectionOut, (collection, windowKey, groupByKey) => {
                result[groupByKey] = collection
            }, true);*/}
        </code>
        <h3 style={groupStyle}>What does it do?</h3>
        <p>
          Pond has three main goals:
          <ol>
            <li><b>Data Structures</b> - Provide a robust set of time-related data structures, built on Immutable.js</li>
            <li><b>Serialization</b> - Provide serialization of these structures for transmission across the wire</li>
            <li><b>Processing</b> - Provide processing operations to work with those structures</li>
          </ol>
          
          Here is a summary of what is provided:
          <ul>
            <li><b>TimeRange</b> - a begin and end time, packaged together</li>
            <li><b>Index</b> - A time range denoted by a string, for example "5m-1234" is a specific 5 minute time range, or "2014-09" is September 2014</li>
            <li><b>TimeEvent</b> - A timestamp and a data object packaged together</li>
            <li><b>IndexedEvents</b> - An Index and a data object packaged together. e.g. 1hr max value</li>
            <li><b>TimeRangeEvents</b> - A TimeRange and a data object packaged together. e.g. outage event occurred from 9:10am until 10:15am</li>
          </ul>

          And forming together collections of events:
          <ul>
            <li><b>Collection</b> - A bag of events, with a helpful set of methods for operating on those events</li>
            <li><b>TimeSeries</b> - An ordered Collection of Events and associated meta data, along with operations to roll-up, aggregate, break apart and recombine TimeSeries.</li>
          </ul>

          And then high level processing via pipelines:
          <ul>
            <li><b>Pipeline</b> - Stream or batch style processing of events to build more complex processing operations, either on fixed TimeSeries or incoming realtime data. Supports windowing, grouping and aggregation.</li>
          </ul>
        
          <h3 style={groupStyle}>Typescript support</h3>
          As of version 0.8.6 Pond ships with Typescript declarations.
          In addition, the project is also being rewritten in Typescript, which will probably eventually lead to a v1.0 version as the API will have significant differences. You can track the progress of that work in Issue #65.
        </p>
      </div>
    );
  }
}

export const Root = (props) => (
  <div style = {{
    display: 'flex'
  }} {...props} />
)

export const Side = (props) => (
  <div style = {{
    width: '21vw',
    height: '100vh',
    overflow: 'auto',
    background: '#eee',
    marginTop: 'auto'
  }} {...props} />
)

export const Main = (props) => (
  <div style = {{
    flex: 1,
    height: '100vh',
    overflow: 'auto',
    marginTop: '50px'
  }}>
  <div style={{ padding: '20px' }} {...props} />
  </div>
)

export default Home;