"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _generator = require("./generator");

var _generator2 = _interopRequireDefault(_generator);

var Aggregator = (function () {
    function Aggregator(size, processor, observer) {
        _classCallCheck(this, Aggregator);

        this._generator = new _generator2["default"](size);
        this._processor = processor;
        this._bucket = null;
        this._observer = observer;
    }

    _createClass(Aggregator, [{
        key: "bucket",

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
    }, {
        key: "done",

        /**
         * Forces the current bucket to emit
         */
        value: function done() {
            var _this2 = this;

            if (this._bucket) {
                this._bucket.aggregate(this._processor, function (event) {
                    if (_this2._observer) {
                        _this2._observer(_this2._bucket.index(), event);
                    }
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
                if (cb) {
                    cb(err);
                }
            });
        }
    }, {
        key: "onEmit",

        /**
         * Set the emit callback after the constructor
         */
        value: function onEmit(cb) {
            this._observer = cb;
        }
    }]);

    return Aggregator;
})();

exports["default"] = Aggregator;
module.exports = exports["default"];