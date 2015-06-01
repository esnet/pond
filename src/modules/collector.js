var Generator = require("./generator");
var _ = require("underscore");
var Immutable = require("immutable");

class Collector {

    constructor(size, observer) {
        this._generator = new Generator(size);
        this._bucket = null;

        //Callback
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    bucket(d) {
        let newBucketIndex = this._generator.bucketIndex(d);
        let bucketIndex = this._bucket ?
            this._bucket.index().asString() : "";

        if (newBucketIndex !== bucketIndex) {
            if (this._bucket) {
                this._bucket.collect(series => {
                    this._observer && this._observer(series);
                });
            }
            this._bucket = this._generator.bucket(d);
        }

        return this._bucket;
    }

    /**
     * Forces the current bucket to emit
     */
    done() {
        if (this._bucket) {
            this._bucket.collect(series => {
                this._observer && this._observer(series);
                this._bucket = null;
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
        this._observer = cb;
    }
}

module.exports = Collector;
