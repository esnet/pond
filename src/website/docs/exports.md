<a name="module.exports"></a>

## module.exports
A Collector is used to accumulate events into multiple collections,
based on potentially many strategies. In this current implementation
a collection is partitioned based on the window that it falls in
and the group it is part of.

Collections are emitted from this class to the supplied onTrigger
callback.

**Kind**: static class of <code>module</code>  
