"use strict";
/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generic node in the stream processing graph, that is typed by
 * its input and output types. Those types are subclasses of Base
 * and would generally be either a Collection, GroupedCollection or
 * WindowedCollection.
 */
// tslint:disable-next-line:max-classes-per-file
/*
export abstract class Node<T extends Base<Key>, U extends Base<Key>> {

    protected store: U;

    protected observers = Immutable.List<Node<U, Base<Key>>>();

    public addObserver(node: Node<U, Base<Key>>): void {
        this.observers = this.observers.push(node);
    }

    public onChange(collection: T) {
        if (this.process(collection)) {
            this.notify();
        }
    }

    protected notify(): void {
        if (this.observers.size > 0) {
            this.observers.forEach((node) => {
                node.onChange(this.store);
            });
        }
    }

    protected abstract process(collection: T): boolean;
}
*/
// tslint:disable-next-line:max-classes-per-file
// class AlignNode extends Node<Collection<Key>, Collection<Key>> {
//     constructor(private options: AlignmentOptions) {
//         super();
//     }
//     process(collection: Collection<Key>): boolean {
//         this.store = collection.align(this.options) as Collection<Key>;
//         return true;
//     }
// }
// tslint:disable-next-line:max-classes-per-file
// class RateNode<T> extends Node<Collection<Key>, Collection<TimeRange>> {
//     constructor(private options: RateOptions) {
//         super();
//     }
//     process(collection: Collection<Key>): boolean {
//         const { fieldSpec, allowNegative } = this.options;
//         this.store = collection.rate(this.options) as Collection<TimeRange>;
//         return true;
//     }
// }
// tslint:disable-next-line:max-classes-per-file
// class GroupNode<T> extends Node<Collection<Key>, GroupedCollection<Key>> {
//     constructor(private fieldSpec: string | string[]) {
//         super();
//     }
//     process(collection: Collection<Key>): boolean {
//         this.store = new GroupedCollection(this.fieldSpec, collection);
//         return true;
//     }
// }
// tslint:disable-next-line:max-classes-per-file
// class FixedWindowNode<T> extends Node<Collection<Key>, Collection<Key>> {
//     constructor(private window: Period, private trigger: Trigger) {
//         super();
//     }
//     process(store: Collection<Key> | GroupedCollection<Key>): boolean {
//         let collection;
//         if (store instanceof GroupedCollection) {
//             collection = store.window(this.window);
//         } else if (store instanceof Collection) {
//             const windowed = new WindowedCollection(this.window, store);
//             collection = windowed.triggeredCollection(this.trigger);
//         }
//         if (!collection) {
//             return false;
//         } else {
//             this.store = collection;
//             return true;
//         }
//     }
// }
/**
 * A tuple representing a single mapping from a key (a string)
 * to a Collection.
 */
// type KeyedCollection<T extends Key> = [ string, Collection<T> ];
/**
 *               window                        agg                      output
 * collection -> [ . ] -> keyed_collection -> [ . ] -> indexed_event -> [ . ] =>
 */
// tslint:disable-next-line:max-classes-per-file
// class AggregationNode<T extends Key> extends Node<KeyedCollection<T>, Event<Index>> {
//     constructor(private aggregationSpec: AggregationSpec<Key>) {
//         super();
//     }
//     process(windowedCollection: KeyedCollection<T>): boolean {
//         const d = {};
//         const [ group, collection ] = windowedCollection;
//         const [ groupKey, windowKey ] = group.split("::");
//         _.forEach(this.aggregationSpec, (src: AggregationTuple, dest: string) => {
//             const [ srcField, reducer ] = src;
//             d[dest] = collection.aggregate(reducer, srcField);
//         });
//         const eventKey = index(windowKey);
//         const indexedEvent = new Event<Index>(eventKey, Immutable.fromJS(d));
//         this.store = indexedEvent;
//         return true;
//     }
// }
// tslint:disable-next-line:max-classes-per-file
// class EventOutputNode extends Node<Event<Key>, Event<Key>> {
//     constructor(private callback: (event: Event<Key>) => void) {
//         super();
//     }
//     process(event: Event<Key>): boolean {
//         if (this.callback) {
//             this.callback(event);
//         }
//         return true;
//     }
// }
// tslint:disable-next-line:max-classes-per-file
// class EventStream<T extends Key> {
//     constructor(private stream: Stream<T>) { }
//     outputEvents(callback: (event: Event<Key>) => void): Stream<T> {
//         // pass
//     }
// }
// interface CollectionMapStream {
//     aggregate(spec: AggregationSpec<Key>): CollectionStream;
// }
// interface CollectionStream {
//     align(options: AlignmentOptions): CollectionStream;
//     rate(options: RateOptions): CollectionStream;
//     aggregate(spec: AggregationSpec<Key>): CollectionStream;
//     fixedWindow(window: Period): CollectionMapStream;
// }
// tslint:disable-next-line:max-classes-per-file
// class CollectionOutputNode extends Node<Collection<Key>, Collection<Key>> {
//     constructor(private callback: (collection: Collection<Key>) => void) {
//         super();
//     }
//     process(collection: Collection<Key>): boolean {
//         if (this.callback) {
//             this.callback(collection);
//         }
//         return true;
//     }
// }
/**
 * A `Stream` object is the public interface to a chain of
 * event processors. After creating a `Stream` you can used the
 * chained methods to build up a pipeline. Once a pipeline
 * is estabished you can the add Events to that pipeline.
 */
// tslint:disable-next-line:max-classes-per-file
/*
export class Stream<T extends Key> {

    private head: Node<Base<T>, Base<T>>;
    private tail: Node<Base<T>, Base<T>>;
    private trigger: Trigger;

    constructor() {
        const n = new EventStream(this);
    }

    public addEvent(event: Event<Key>) {
        this.head = this.store.addEvent(event);
        this.notify();
    }

    protected appendNode<T, U>(node: Node<T, U>) {
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    //
    // Processing
    //

    align(options: AlignmentOptions): this {
        const node = new AlignNode(options);
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    rate(options: RateOptions): this {
        const node = new RateNode(options);
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    aggregate(spec: AggregationSpec<Key>): this {
        const node = new AggregationNode(spec);
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    //
    // Streaming state
    //

    fixedWindow(window: Period): this {
        const node = new FixedWindowNode(window, this.trigger);
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    groupBy(fieldSpec: string | string[]): this {
        const node = new GroupNode(fieldSpec);
        this.tail.addObserver(node);
        this.tail = node;
        return this;
    }

    emitPerEvent(): this {
        this.trigger = Trigger.perEvent;
        return this;
    }

    //
    // Output
    //

    outputEvents(callback: (event: Event<Key>) => void) {
        const node = new EventOutputNode(callback);
        this.tail.addObserver(node);
        this.tail = null;
        return this;
    }

    output(callback: (collection: Collection<Key>) => void) {
        const node = new CollectionOutputNode(callback);
        this.tail.addObserver(node);
        this.tail = null;
        return this;
    }

    process() {
        return true;
    }
}
*/
/*
function streamFactory(): Stream {
    return new Stream();
}

export { streamFactory as stream };
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0dBUUc7O0FBNkJIOzs7OztHQUtHO0FBQ0gsZ0RBQWdEO0FBQ2hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyQkU7QUFDRixnREFBZ0Q7QUFDaEQsbUVBQW1FO0FBQ25FLHVEQUF1RDtBQUN2RCxtQkFBbUI7QUFDbkIsUUFBUTtBQUNSLHNEQUFzRDtBQUN0RCwwRUFBMEU7QUFDMUUsdUJBQXVCO0FBQ3ZCLFFBQVE7QUFDUixJQUFJO0FBRUosZ0RBQWdEO0FBQ2hELDJFQUEyRTtBQUMzRSxrREFBa0Q7QUFDbEQsbUJBQW1CO0FBQ25CLFFBQVE7QUFDUixzREFBc0Q7QUFDdEQsNkRBQTZEO0FBQzdELCtFQUErRTtBQUMvRSx1QkFBdUI7QUFDdkIsUUFBUTtBQUNSLElBQUk7QUFFSixnREFBZ0Q7QUFDaEQsNkVBQTZFO0FBQzdFLDBEQUEwRDtBQUMxRCxtQkFBbUI7QUFDbkIsUUFBUTtBQUNSLHNEQUFzRDtBQUN0RCwwRUFBMEU7QUFDMUUsdUJBQXVCO0FBQ3ZCLFFBQVE7QUFDUixJQUFJO0FBRUosZ0RBQWdEO0FBQ2hELDRFQUE0RTtBQUM1RSxzRUFBc0U7QUFDdEUsbUJBQW1CO0FBQ25CLFFBQVE7QUFDUiwwRUFBMEU7QUFDMUUsMEJBQTBCO0FBQzFCLG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsb0RBQW9EO0FBQ3BELDJFQUEyRTtBQUMzRSx1RUFBdUU7QUFDdkUsWUFBWTtBQUNaLDZCQUE2QjtBQUM3Qiw0QkFBNEI7QUFDNUIsbUJBQW1CO0FBQ25CLHVDQUF1QztBQUN2QywyQkFBMkI7QUFDM0IsWUFBWTtBQUNaLFFBQVE7QUFDUixJQUFJO0FBRUo7OztHQUdHO0FBQ0gsbUVBQW1FO0FBRW5FOzs7R0FHRztBQUVILGdEQUFnRDtBQUNoRCx3RkFBd0Y7QUFDeEYsbUVBQW1FO0FBQ25FLG1CQUFtQjtBQUNuQixRQUFRO0FBQ1IsaUVBQWlFO0FBQ2pFLHdCQUF3QjtBQUN4Qiw0REFBNEQ7QUFDNUQsNkRBQTZEO0FBQzdELHFGQUFxRjtBQUNyRixpREFBaUQ7QUFDakQsaUVBQWlFO0FBQ2pFLGNBQWM7QUFDZCw2Q0FBNkM7QUFDN0MsZ0ZBQWdGO0FBQ2hGLHFDQUFxQztBQUNyQyx1QkFBdUI7QUFDdkIsUUFBUTtBQUNSLElBQUk7QUFFSixnREFBZ0Q7QUFDaEQsK0RBQStEO0FBQy9ELG1FQUFtRTtBQUNuRSxtQkFBbUI7QUFDbkIsUUFBUTtBQUNSLDRDQUE0QztBQUM1QywrQkFBK0I7QUFDL0Isb0NBQW9DO0FBQ3BDLFlBQVk7QUFDWix1QkFBdUI7QUFDdkIsUUFBUTtBQUNSLElBQUk7QUFFSixnREFBZ0Q7QUFDaEQscUNBQXFDO0FBQ3JDLGlEQUFpRDtBQUNqRCx1RUFBdUU7QUFDdkUsa0JBQWtCO0FBQ2xCLFFBQVE7QUFDUixJQUFJO0FBRUosa0NBQWtDO0FBQ2xDLCtEQUErRDtBQUMvRCxJQUFJO0FBRUosK0JBQStCO0FBQy9CLDBEQUEwRDtBQUMxRCxvREFBb0Q7QUFDcEQsK0RBQStEO0FBQy9ELHdEQUF3RDtBQUN4RCxJQUFJO0FBRUosZ0RBQWdEO0FBQ2hELDhFQUE4RTtBQUM5RSw2RUFBNkU7QUFDN0UsbUJBQW1CO0FBQ25CLFFBQVE7QUFDUixzREFBc0Q7QUFDdEQsK0JBQStCO0FBQy9CLHlDQUF5QztBQUN6QyxZQUFZO0FBQ1osdUJBQXVCO0FBQ3ZCLFFBQVE7QUFDUixJQUFJO0FBRUo7Ozs7O0dBS0c7QUFDSCxnREFBZ0Q7QUFDaEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNEZFO0FBRUY7Ozs7OztFQU1FIn0=