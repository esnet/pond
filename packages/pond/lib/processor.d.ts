import * as Immutable from "immutable";
import { Event } from "./event";
import { Key } from "./key";
/**
 * Internal abstract base class for streaming chains. A `Processor` is something
 * that implements at a minimum one method: `addEvent()`. The return of that
 * method is a list of output `Event`s.
 *
 * `Align`, `Fill` etc are implementations of this abstract class. Those in turn
 * are used jointly to implemented within the `Collection` classes. For example
 * `Align` implements `Processor` to combine its own state (or past `Event`s) with
 * the incoming `Event` to output aligned `Event`s (new `Event`s that fall on
 * a periodic boundary). The `Align` class is then utilized in the `Collection` class
 * by using it within a `flatMap` to process all `Event`s within the `Collection` into
 * a new set of `Event`s. It is also used when implementing stream processing that
 * requires `align` processing.
 */
export declare abstract class Processor<T extends Key, S extends Key> {
    abstract addEvent(event: Event<T>, options?: any): Immutable.List<Event<S>>;
}
