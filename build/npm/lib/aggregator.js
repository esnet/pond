"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Generator = _interopRequire(require("./generator"));

var Aggregator = (function () {
    function Aggregator(size, processor, observer) {
        _classCallCheck(this, Aggregator);

        this._generator = new Generator(size);
        this._processor = processor;
        this._bucket = null;
        this._observer = observer;
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
                var currentBucketIndex = this._bucket ? this._bucket.index().asString() : "";
                if (thisBucketIndex !== currentBucketIndex) {
                    if (this._bucket) {
                        this._bucket.aggregate(this._processor, function (event) {
                            if (_this._observer) {
                                _this._observer(_this._bucket.index(), event);
                            }
                        });
                    }
                    this._bucket = this._generator.bucket(d);
                }
                return this._bucket;
            }
        },
        done: {

            /**
             * Forces the current bucket to emit
             */

            value: function done() {
                var _this = this;

                if (this._bucket) {
                    this._bucket.aggregate(this._processor, function (event) {
                        if (_this._observer) {
                            _this._observer(_this._bucket.index(), event);
                        }
                        _this._bucket = null;
                    });
                }
            }
        },
        addEvent: {

            /**
             * Add an event, which will be assigned to a bucket
             */

            value: function addEvent(event, cb) {
                var t = event.timestamp();
                var bucket = this.bucket(t);

                //
                // Adding the value to the bucket. This could be an async operation
                // so the passed in callback to this function will be called when this
                // is done.
                //

                bucket.addEvent(event, function (err) {
                    if (err) {
                        console.error("Could not add value to bucket:", err);
                    }
                    if (cb) {
                        cb(err);
                    }
                });
            }
        },
        onEmit: {

            /**
             * Set the emit callback after the constructor
             */

            value: function onEmit(cb) {
                this._observer = cb;
            }
        }
    });

    return Aggregator;
})();

module.exports = Aggregator;