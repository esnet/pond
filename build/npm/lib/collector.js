"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Generator = require("./generator");
var _ = require("underscore");
var Immutable = require("immutable");

var Collector = (function () {
    function Collector(size, observer) {
        _classCallCheck(this, Collector);

        this._generator = new Generator(size);
        this._bucket = null;

        //Callback
        this._observer = observer;
    }

    _createClass(Collector, [{
        key: "bucket",

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
                        _this._observer && _this._observer(series);
                    });
                }
                this._bucket = this._generator.bucket(d);
            }

            return this._bucket;
        }
    }, {
        key: "done",

        /**
         * Forces the current bucket to emit
         */
        value: function done() {
            var _this2 = this;

            if (this._bucket) {
                this._bucket.collect(function (series) {
                    _this2._observer && _this2._observer(series);
                    _this2._bucket = null;
                });
            }
        }
    }, {
        key: "addEvent",

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
                cb && cb(err);
            });
        }
    }, {
        key: "onEmit",
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return Collector;
})();

module.exports = Collector;