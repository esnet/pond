<a name="Runner"></a>

## Runner
A runner is used to extract the chain of processing operations
from a Pipeline given an Output. The idea here is to traverse
back up the Pipeline(s) and build an execution chain.

When the runner is started, events from the "in" are streamed
into the execution chain and outputed into the "out".

Rebuilding in this way enables us to handle connected pipelines:

                    |--
 in --> pipeline ---.
                    |----pipeline ---| -> out

The runner breaks this into the following for execution:

  _input        - the "in" or from() bounded input of
                  the upstream pipeline
  _processChain - the process nodes in the pipelines
                  leading to the out
  _output       - the supplied output destination for
                  the batch process

NOTE: There's no current way to merge multiple sources, though
      a time series has a TimeSeries.merge() static method for
      this purpose.

**Kind**: global class  

* [Runner](#Runner)
    * [new Runner(pipeline, output)](#new_Runner_new)
    * [.start(force)](#Runner+start)

<a name="new_Runner_new"></a>

### new Runner(pipeline, output)
Create a new batch runner.

**Params**

- pipeline <code>[Pipeline](#Pipeline)</code> - The pipeline to run
- output <code>PipelineOut</code> - The output driving this runner

<a name="Runner+start"></a>

### runner.start(force)
Start the runner

**Kind**: instance method of <code>[Runner](#Runner)</code>  
**Params**

- force <code>Boolean</code> <code> = false</code> - Force a flush at the end of the batch source
                        to cause any buffers to emit.

