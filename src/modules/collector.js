var Generator = require("./generator");
var _ = require("underscore");
var Immutable = require("immutable");

class Collector {

    constructor(size, observer) {
        this._generator = new Generator(size);
        this._currentBucket = null;

        //Callback
        this._onEmit = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    bucket(d) {
        let thisBucketIndex = this._generator.bucketIndex(d);
        let currentBucketIndex = this._currentBucket ?
            this._currentBucket.index().asString() : "";

        if (thisBucketIndex !== currentBucketIndex) {
            if (this._currentBucket) {
                this._currentBucket.collect((series) => {
                    this._onEmit && this._onEmit(series);
                });
            }
            this._currentBucket = this._generator.bucket(d);
        }

        return this._currentBucket;
    }

    /**
     * Forces the current bucket to emit
     */
    done() {
        if (this._currentBucket) {
            this._currentBucket.collect((series) => {
                this._onEmit && this._onEmit(series);
                this._currentBucket = null;
            });
        }
    }

    /**
     * Add an event, which will be assigned to a bucket
     */
    addEvent(event, cb) {
        let t = event.timestamp();
        let bucket = this.bucket(t);

        //
        // Adding the value to the bucket. This could be an async operation
        // so the passed in callback to this function will be called when this
        // is done.
        //

        bucket.addEvent(event, function(err) {
            if (err) {
                console.error("Could not add value to bucket:", err);
            }
            cb && cb(err);
        });
    }

    onEmit(cb) {
        this._onEmit = cb;
    }
}

module.exports = Collector;
