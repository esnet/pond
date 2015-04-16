var Generator = require("./generator");
var _ = require("underscore");

class Aggregator extends Generator {

    constructor(size, aggFn, selector) {
        super(size);
        this._aggregationFn = aggFn;
        this._selector = selector || "value";
        this._cachedBuckets = {};
        this._onValueChange = null;
    }

    bucket(d) {
        //Check the cached first, otherwise make one, and return it.
        var pos = this._bucketPosFromDate(d);
        var cacheKey = this.size + "-" + pos;
        console.log("   %% cacheKey", cacheKey);
        if (_.has(this._cachedBuckets, cacheKey)) {
            console.log("       %%% FROM CACHE", cacheKey);
            return this._cachedBuckets[cacheKey];
        } else {
            console.log("       %%% CREATING...", cacheKey);
            var bucket = super.bucket(d);
            this._cachedBuckets[cacheKey] = bucket;
            return bucket;
        }
    }

    addEvent(inputEvent) {
        var self = this;

        console.log("% adding event", inputEvent.timestamp())

        var bucket = this.bucket(inputEvent.timestamp());
        var inputEventData = inputEvent.data();

        var d = _.isFunction(this._selector) ? this._selector.call(this, inputEventData) :
                                               inputEventData.get(this._selector);

        console.log(" ** adding inputEvent", inputEventData, this._selector, d);

        bucket.addValue(d, this._aggregationFn, function(outputEvent) {
            console.log("addValue callback", outputEvent);
            self._onValueChange && self._onValueChange(bucket.index(), outputEvent);
        });
    }

    onValueChanged(cb) {
        this._onValueChange = cb;
    }
}

module.exports = Aggregator;
