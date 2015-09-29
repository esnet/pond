import moment from "moment";
import _ from "underscore";
import Bucket from "./bucket";

var units = {
    s: {label: "seconds", length: 1},
    m: {label: "minutes", length: 60},
    h: {label: "hours", length: 60 * 60},
    d: {label: "days", length: 60 * 60 * 24}
};

/**
 * A BucketGenerator
 *
 * To use a BucketGenerator you supply the size of the buckets you want
 * e.g. "1h" for hourly. Then you call bucket() as needed, each time
 * with a date. The bucket containing that date will be returned.
 *
 * Buckets can then be used to aggregate data.
 *
 * @param {string} size The size of the bucket (e.g. 1d, 6h, 5m, 30s)
 */
export default class Generator {

    constructor(size) {
        this._size = size;
        this._length = Generator.getLengthFromSize(size);
    }

    /**
     * Takes the size (e.g. 1d, 6h, 5m, 30s) and returns the length
     * of the bucket in ms.
     */
    static getLengthFromSize(size) {
        let length;

        // Size should be two parts, a number and a letter. From the size
        // we can get the length
        const re = /([0-9]+)([smhd])/;
        const parts = re.exec(size);
        if (parts && parts.length >= 3) {
            const num = parseInt(parts[1], 10);
            const unit = parts[2];
            length = num * units[unit].length * 1000;
        }
        return length;
    }

    static getBucketPosFromDate(date, length) {
        let dd = moment.utc(date).valueOf();
        return parseInt(dd /= length, 10);
    }


    bucketIndex(date) {
        const pos = Generator.getBucketPosFromDate(date, this._length);
        const index = `${this._size}-${pos}`;
        return index;
    }

    bucketIndexList(date1, date2) {
        const pos1 = Generator.getBucketPosFromDate(date1, this._length);
        const pos2 = Generator.getBucketPosFromDate(date2, this._length);
        let indexList = [];
        if (pos1 <= pos2) {
            for (let pos = pos1; pos <= pos2; pos++) {
                indexList.push(`${this._size}-${pos}`);
            }
        }
        return indexList;
    }

    /**
     * Date in is assumed to be local and that the bucket will be
     * created in UTC time. Note that this doesn't really matter
     * for seconds, minutes, or hours. But days will be offset from
     * midnight to midnight, depending on local timezone.
     */
    bucket(date) {
        const index = this.bucketIndex(date);
        return new Bucket(index);
    }

    bucketList(date1, date2) {
        const indexList = this.bucketIndexList(date1, date2);
        return _.map(indexList, (index) => new Bucket(index));
    }
}
