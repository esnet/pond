"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Generator = _interopRequire(require("./generator"));

var Collector = (function () {
    function Collector(size, observer) {
        _classCallCheck(this, Collector);

        this._generator = new Generator(size);
        this._bucket = null;

        // Callback
        this._observer = observer;
    }

    _createClass(Collector, {
        bucket: {

            /**
             * Gets the current bucket or returns a new one.
             *
             * If a new bucket is generated the result of the old bucket is emitted
             * automatically.
             */

            value: function bucket(d) {
                var _this = this;

                var newBucketIndex = this._generator.bucketIndex(d);
                var bucketIndex = this._bucket ? this._bucket.index().asString() : "";
                if (newBucketIndex !== bucketIndex) {
                    if (this._bucket) {
                        this._bucket.collect(function (series) {
                            if (_this._observer) _this._observer(series);
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
                    this._bucket.collect(function (series) {
                        if (_this._observer) _this._observer(series);
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
                bucket.addEvent(event, function (err) {
                    if (err) {
                        console.error("Could not add value to bucket:", err);
                    }
                    if (cb) cb(err);
                });
            }
        },
        onEmit: {
            value: function onEmit(cb) {
                this._observer = cb;
            }
        }
    });

    return Collector;
})();

module.exports = Collector;