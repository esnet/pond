import * as Immutable from "immutable";
import * as moment from "moment";
import Index from "./indexed";
import TimeRange from "./timerange";
declare var _default: {
    leftPad: (value: number) => string;
    windowDuration: (period: any) => number;
    windowPositionFromDate: (period: string, date: Date) => number;
    rangeFromIndexString: (indexString: string, utc: boolean) => TimeRange;
    niceIndexString: (indexString: string, format: string) => string;
    isMissing: (val: any) => boolean;
    fieldAsArray: {
        (): string[];
        (fieldSpec: string): string[];
        (fieldSpec: string[]): string[];
    };
    timestampFromArg: {
        (arg: number): Date;
        (arg: string): Date;
        (arg: Date): Date;
        (arg: moment.Moment): Date;
    };
    timeRangeFromArg: {
        (arg: TimeRange): TimeRange;
        (arg: string): TimeRange;
        (arg: Date[]): TimeRange;
    };
    indexFromArgs: (arg1: string | Index, arg2?: boolean) => Index;
    dataFromArg: (arg: string | number | Object | Immutable.Map<string, any>) => Immutable.Map<string, any>;
};
export default _default;
