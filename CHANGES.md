
### 0.3.0

 * Better support for nested objects:
    * Converts deeper structures to Immutable objects internally
    * Added "value functions" to operations that deal with columns of values so that you can pull out internals of nested structures.
    * Event's get() function will convert deep Immutable structures to JS objects.
 * You can now use either value() or get() to get a value out of an Event.
 * Added ability to convert to time based Events when inserting IndexedEvents into a collection. This can be much faster to query.
 * Began work on ability to do things like sum a series or isolate columns of a series.
 * Website update as well as uniform linting

