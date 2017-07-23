import * as Immutable from "immutable";
import { Event } from "./event";
import { Key } from "./key";
export declare abstract class Processor<T extends Key, S extends Key> {
    abstract addEvent(event: Event<T>, options?: any): Immutable.List<Event<S>>;
}
