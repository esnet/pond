/**
 * Defines the interface for all event keys
 */
export declare abstract class Key {
    abstract type(): string;
    abstract toJSON(): {};
    abstract toString(): string;
    abstract timestamp(): Date;
    abstract begin(): Date;
    abstract end(): Date;
}
