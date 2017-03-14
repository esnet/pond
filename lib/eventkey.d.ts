/**
 * Defines the interface for all event keys
 */
declare abstract class EventKey {
    abstract type(): string;
    abstract toJSON(): Object;
    abstract toString(): string;
    abstract timestamp(): Date;
    abstract begin(): Date;
    abstract end(): Date;
}
export default EventKey;
