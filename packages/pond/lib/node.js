"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const _ = require("lodash");
const event_1 = require("./event");
const index_1 = require("./index");
const align_1 = require("./align");
const collapse_1 = require("./collapse");
const fill_1 = require("./fill");
const rate_1 = require("./rate");
const reduce_1 = require("./reduce");
const select_1 = require("./select");
const windowedcollection_1 = require("./windowedcollection");
/**
 * @private
 *
 * A Node is a transformation between type S and type T. Both S
 * and T much extend Base.
 *
 * The transformation happens when a `Node` has its `set()` method called
 * by another `Node`. The `input` to set() is of type `S`. When this happens
 * a subclass specific implementation of `process` is called to actually
 * transform the input (of type `S` to an output of type `T`). Of course
 * `S` and `T` maybe the same if the input and output types are expected
 * to be the same. The result of `process`, of type `T`, is returned and
 * the passed onto other downstream Nodes, by calling their `set()` methods.
 */
// tslint:disable-next-line:max-classes-per-file
class Node {
    constructor() {
        this.observers = Immutable.List();
    }
    addObserver(node) {
        this.observers = this.observers.push(node);
    }
    set(input) {
        const outputs = this.process(input);
        if (outputs) {
            outputs.forEach(output => this.notify(output));
        }
    }
    notify(output) {
        if (this.observers.size > 0) {
            this.observers.forEach(node => {
                node.set(output);
            });
        }
    }
}
exports.Node = Node;
//
// Nodes
//
/**
 * @private
 *
 * A node which will be at the top of the chain input node. It will accept `Event`s
 * and pass them down the processing chain.
 */
// tslint:disable-next-line:max-classes-per-file
class EventInputNode extends Node {
    constructor() {
        super();
        // pass
    }
    process(e) {
        return Immutable.List([e]);
    }
}
exports.EventInputNode = EventInputNode;
/**
 * @private
 *
 * A node which will be a top of the chain input node. It will accept `KeyedCollection`s
 * and pass them down the processing chain.
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionInputNode extends Node {
    constructor() {
        super();
        // pass
    }
    process(e) {
        return Immutable.List([e]);
    }
}
exports.KeyedCollectionInputNode = KeyedCollectionInputNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class EventOutputNode extends Node {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    process(e) {
        this.callback(e);
        return Immutable.List();
    }
}
exports.EventOutputNode = EventOutputNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class KeyedCollectionOutputNode extends Node {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    process(keyedCollection) {
        const [key, collection] = keyedCollection;
        this.callback(collection, key);
        return Immutable.List();
    }
}
exports.KeyedCollectionOutputNode = KeyedCollectionOutputNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class MapNode extends Node {
    constructor(mapper) {
        super();
        this.mapper = mapper;
    }
    process(e) {
        return Immutable.List([this.mapper(e)]);
    }
}
exports.MapNode = MapNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FlatMapNode extends Node {
    constructor(mapper) {
        super();
        this.mapper = mapper;
    }
    process(e) {
        return this.mapper(e);
    }
}
exports.FlatMapNode = FlatMapNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FilterNode extends Node {
    constructor(predicate) {
        super();
        this.predicate = predicate;
    }
    process(e) {
        return this.predicate(e) ? Immutable.List([e]) : Immutable.List([]);
    }
}
exports.FilterNode = FilterNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class FillNode extends Node {
    constructor(options) {
        super();
        this.processor = new fill_1.Fill(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.FillNode = FillNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AlignNode extends Node {
    constructor(options) {
        super();
        this.processor = new align_1.Align(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.AlignNode = AlignNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class SelectNode extends Node {
    constructor(options) {
        super();
        this.processor = new select_1.Select(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.SelectNode = SelectNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class CollapseNode extends Node {
    constructor(options) {
        super();
        this.processor = new collapse_1.Collapse(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.CollapseNode = CollapseNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class RateNode extends Node {
    constructor(options) {
        super();
        this.processor = new rate_1.Rate(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.RateNode = RateNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class ReduceNode extends Node {
    constructor(options) {
        super();
        this.processor = new reduce_1.Reducer(options);
    }
    process(e) {
        return this.processor.addEvent(e);
    }
}
exports.ReduceNode = ReduceNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class WindowOutputNode extends Node {
    constructor(options) {
        super();
        this.processor = new windowedcollection_1.WindowedCollection(options);
    }
    process(e) {
        const keyedCollections = this.processor.addEvent(e);
        return keyedCollections;
    }
}
exports.WindowOutputNode = WindowOutputNode;
/**
 * @private
 *
 */
// tslint:disable-next-line:max-classes-per-file
class AggregationNode extends Node {
    constructor(aggregationSpec) {
        super();
        this.aggregationSpec = aggregationSpec;
    }
    process(keyedCollection) {
        const [group, collection] = keyedCollection;
        const d = {};
        const [groupKey, windowKey] = group.split("::").length === 2 ? group.split("::") : [null, group];
        _.forEach(this.aggregationSpec, (src, dest) => {
            const [srcField, reducer] = src;
            d[dest] = collection.aggregate(reducer, srcField);
        });
        const indexedEvent = new event_1.Event(index_1.index(windowKey), Immutable.fromJS(d));
        return Immutable.List([indexedEvent]);
    }
}
exports.AggregationNode = AggregationNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUk1QixtQ0FBdUM7QUFDdkMsbUNBQXVDO0FBSXZDLG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsaUNBQThCO0FBQzlCLGlDQUE4QjtBQUM5QixxQ0FBbUM7QUFDbkMscUNBQWtDO0FBR2xDLDZEQUEwRDtBQWlCMUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILGdEQUFnRDtBQUNoRDtJQUFBO1FBQ2MsY0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQWlCLENBQUM7SUFzQjFELENBQUM7SUFwQlUsV0FBVyxDQUFDLElBQW1CO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLEdBQUcsQ0FBQyxLQUFRO1FBQ2YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0lBQ0wsQ0FBQztJQUVTLE1BQU0sQ0FBQyxNQUFTO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztDQUdKO0FB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