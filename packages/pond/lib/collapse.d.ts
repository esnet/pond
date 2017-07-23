import { Event } from "./event";
import { Key } from "./key";
import { CollapseOptions } from "./types";
/**
 * A processor which takes a fieldSpec and returns a new event
 * with a new column that is a collapsed result of the selected
 * columns. To collapse the columns it uses the supplied reducer
 * function. Optionally the new column can completely replace
 * the existing columns in the event.
 */
export declare class Collapse<T extends Key> {
    private options;
    constructor(options: CollapseOptions);
    addEvent(event: Event<T>): Event<T>;
}
