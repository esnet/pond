"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Generator = require("./generator");
var _ = require("underscore");

var Aggregator = (function () {
    function Aggregator(size, processor, selector, observer) {
        _classCallCheck(this, Aggregator);

        this._generator = new Generator(size);
        this._processor = processor;
        this._selector = selector || "value";
        this._currentBucket = null;

        //Callback
        this._onEmit = null;
    }

    _createClass(Aggregator, {
        bucket: {

            /**
             * Gets the current bucket or returns a new one.
             *
             * If a new bucket is generated the result of the old bucket is emitted
             * automatically.
             */

            value: function bucket(d) {
                var _this = this;

                var thisBucketIndex = this._generator.bucketIndex(d);
                var currentBucketIndex = this._currentBucket ? this._currentBucket.index().asString() : "";

                if (thisBucketIndex !== currentBucketIndex) {
                    if (this._currentBucket) {
                        this._currentBucket.sync(this._processor, function (bucketValue) {
                            _this._onEmit && _this._onEmit(_this._currentBucket.index(), bucketValue);
                        });
                    }
                    this._currentBucket = this._generator.bucket(d);
                }

                return this._currentBucket;
            }
        },
        done: {

            /**
             * Forces the current bucket to emit
             */

            value: function done() {
                var _this = this;

                if (this._currentBucket) {
                    this._currentBucket.sync(this._processor, function (bucketValue) {
                        _this._onEmit && _this._onEmit(_this._currentBucket.index(), bucketValue);
                        _this._currentBucket = null;
                    });
                }
            }
        },
        addEvent: {

            /**
             * Add an event, which will be assigned to a bucket
             */

            value: function addEvent(inputEvent, cb) {
                var bucket = this.bucket(inputEvent.timestamp());
                var inputEventData = inputEvent.data();

                //
                // The selector can be a function to extract what is added to the
                // bucket, or it can be a string corresponding to a key to get out
                // of the inputEvent data. If a selector isn't available then the
                // whole event is passed to the bucket
                //

                var d = undefined;
                if (_.isFunction(this._selector)) {
                    d = this._selector.call(this, inputEventData);
                } else if (_.isString(this._selector)) {
                    d = inputEventData.get(this._selector);
                } else {
                    d = inputEvent;
                }

                bucket.addValue(d, this._aggregationFn, function (err) {
                    if (err) {
                        console.error("Could not add value to bucket:", err);
                    }
                    cb && cb(err);
                });
            }
        },
        onEmit: {
            value: function onEmit(cb) {
                this._onEmit = cb;
            }
        }
    });

    return Aggregator;
})();

module.exports = Aggregator;