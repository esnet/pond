var Generator = require("./generator");
var _ = require("underscore");

class Aggregator {

    constructor(size, processor, selector, observer) {
        this._generator = new Generator(size);
        this._processor = processor;
        this._selector = selector || "value";
        this._currentBucket = null;

        //Callback
        this._onEmit = null;
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
                this._currentBucket.sync(this._processor, (bucketValue) => {
                    this._onEmit && this._onEmit(this._currentBucket.index(),
                                                 bucketValue);
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
            this._currentBucket.sync(this._processor, (bucketValue) => {
                this._onEmit && this._onEmit(this._currentBucket.index(),
                                             bucketValue);
                this._currentBucket = null;
            });
        }
    }

    /**
     * Add an event, which will be assigned to a bucket
     */
    addEvent(inputEvent, cb) {
        let bucket = this.bucket(inputEvent.timestamp());
        let inputEventData = inputEvent.data();

        //
        // The selector can be a function to extract what is added to the
        // bucket, or it can be a string corresponding to a key to get out
        // of the inputEvent data. If a selector isn't available then the
        // whole event is passed to the bucket
        //

        let d;
        if (_.isFunction(this._selector)) {
            d = this._selector.call(this, inputEventData);
        } else if (_.isString(this._selector)) {
            d = inputEventData.get(this._selector)
        } else {
            d = inputEvent;
        }

        bucket.addValue(d, this._aggregationFn, function(err) {
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

module.exports = Aggregator;
