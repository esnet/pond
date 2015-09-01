import Generator from "./generator";

export default class Collector {

    constructor(size, observer) {
        this._generator = new Generator(size);
        this._bucket = null;

        // Callback
        this._observer = observer;
    }

    /**
     * Gets the current bucket or returns a new one.
     *
     * If a new bucket is generated the result of the old bucket is emitted
     * automatically.
     */
    bucket(d) {
        const newBucketIndex = this._generator.bucketIndex(d);
        const bucketIndex = this._bucket ? this._bucket.index().asString() : "";
        if (newBucketIndex !== bucketIndex) {
            if (this._bucket) {
                this._bucket.collect(series => {
                    if (this._observer) {
                        this._observer(series);
                    }
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
                if (this._observer) {
                    this._observer(series);
                }
                this._bucket = null;
            });
        }
    }

    /**
     * Add an event, which will be assigned to a bucket
     */
    addEvent(event, cb) {
        const t = event.timestamp();
        const bucket = this.bucket(t);
        bucket.addEvent(event, function (err) {
            if (err) {
                console.error("Could not add value to bucket:", err);
            }
            if (cb) {
                cb(err);
            }
        });
    }

    onEmit(cb) {
        this._observer = cb;
    }
}
