"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _bucket = require("./bucket");

var _bucket2 = _interopRequireDefault(_bucket);

var units = {
    "s": { "label": "seconds", "length": 1 },
    "m": { "label": "minutes", "length": 60 },
    "h": { "label": "hours", "length": 60 * 60 },
    "d": { "label": "days", "length": 60 * 60 * 24 }
};

/**
 * A BucketGenerator
 *
 * To use a BucketGenerator you supply the size of the buckets you want
 * e.g. "1h" for hourly. Then you call bucket() as needed, each time
 * with a date. The bucket containing that date will be returned.
 *
 * Buckets can then be used to aggregate data.
 *
 * @param {string} size The size of the bucket (e.g. 1d, 6h, 5m, 30s)
 */

var Generator = (function () {
    function Generator(size) {
        _classCallCheck(this, Generator);

        this._size = size;
        this._length = Generator.getLengthFromSize(size);
    }

    _createClass(Generator, [{
        key: "bucketIndex",
        value: function bucketIndex(date) {
            var pos = Generator.getBucketPosFromDate(date, this._length);
            var index = this._size + "-" + pos;
            return index;
        }
    }, {
        key: "bucket",

        /**
         * Date in is assumed to be local and that the bucket will be
         * created in UTC time. Note that this doesn't really matter
         * for seconds, minutes, or hours. But days will be offset from
         * midnight to midnight, depending on local timezone.
         */
        value: function bucket(date) {
            var index = this.bucketIndex(date);
            return new _bucket2["default"](index);
        }
    }], [{
        key: "getLengthFromSize",

        /**
         * Takes the size (e.g. 1d, 6h, 5m, 30s) and returns the length
         * of the bucket in ms.
         */
        value: function getLengthFromSize(size) {
            var length = undefined;

            // Size should be two parts, a number and a letter. From the size
            // we can get the length
            var re = /([0-9]+)([smhd])/;
            var parts = re.exec(size);
            if (parts && parts.length >= 3) {
                var num = parseInt(parts[1], 10);
                var unit = parts[2];
                length = num * units[unit].length * 1000;
            }
            return length;
        }
    }, {
        key: "getBucketPosFromDate",
        value: function getBucketPosFromDate(date, length) {
            var dd = _moment2["default"].utc(date).valueOf();
            return parseInt(dd /= length, 10);
        }
    }]);

    return Generator;
})();

exports["default"] = Generator;
module.exports = exports["default"];