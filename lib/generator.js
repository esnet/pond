/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _bucket = require("./bucket");

var _bucket2 = _interopRequireDefault(_bucket);

var _range = require("./range");

var _range2 = _interopRequireDefault(_range);

var units = {
    s: { label: "seconds", length: 1 },
    m: { label: "minutes", length: 60 },
    h: { label: "hours", length: 60 * 60 },
    d: { label: "days", length: 60 * 60 * 24 }
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

    /**
     * Takes the size (e.g. 1d, 6h, 5m, 30s) and returns the length
     * of the bucket in ms.
     */

    _createClass(Generator, [{
        key: "bucketIndex",
        value: function bucketIndex(date) {
            var pos = Generator.getBucketPosFromDate(date, this._length);
            var index = this._size + "-" + pos;
            return index;
        }

        /**
         * Get a list of Index strings, given either:
         *   - Two dates
         *   - A TimeRange
         * Example output:
         *   ["5m-4754394", "5m-4754395", ..., "5m-4754405"]
         */
    }, {
        key: "bucketIndexList",
        value: function bucketIndexList(timerange) {
            var pos1 = Generator.getBucketPosFromDate(timerange.begin(), this._length);
            var pos2 = Generator.getBucketPosFromDate(timerange.end(), this._length);
            var indexList = [];
            if (pos1 <= pos2) {
                for (var pos = pos1; pos <= pos2; pos++) {
                    indexList.push(this._size + "-" + pos);
                }
            }
            return indexList;
        }

        /**
         * Date in is assumed to be local and that the bucket will be
         * created in UTC time. Note that this doesn't really matter
         * for seconds, minutes, or hours. But days will be offset from
         * midnight to midnight, depending on local timezone.
         */
    }, {
        key: "bucket",
        value: function bucket(date) {
            var index = this.bucketIndex(date);
            return new _bucket2["default"](index);
        }
    }, {
        key: "bucketList",
        value: function bucketList(date1, date2) {
            var timerange = new _range2["default"](date1, date2);
            var indexList = this.bucketIndexList(timerange);
            return _underscore2["default"].map(indexList, function (index) {
                return new _bucket2["default"](index);
            });
        }
    }], [{
        key: "getLengthFromSize",
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