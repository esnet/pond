"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _immutable = _interopRequireDefault(require("immutable"));

var _moment = _interopRequireDefault(require("moment"));

var _timerange = _interopRequireDefault(require("../timerange"));

var _index = _interopRequireDefault(require("../index"));

/**
 *  Copyright (c) 2015-2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */
var units = {
  s: {
    label: "seconds",
    length: 1
  },
  m: {
    label: "minutes",
    length: 60
  },
  h: {
    label: "hours",
    length: 60 * 60
  },
  d: {
    label: "days",
    length: 60 * 60 * 24
  }
};
/**
 * This function will take an index, which may be of two forms:
 *     2015-07-14  (day)
 *     2015-07     (month)
 *     2015        (year)
 * or:
 *     1d-278      (range, in n x days, hours, minutes or seconds)
 *
 * and return a TimeRange for that time. The TimeRange may be considered to be
 * local time or UTC time, depending on the utc flag passed in.
 */

var _default = {
  /**
   * Single zero left padding, for days and months.
   */
  leftPad(value) {
    return "".concat(value < 10 ? "0" : "").concat(value);
  },

  /**
   * Returns a duration in milliseconds given a window duration string.
   * For example "30s" (30 seconds) should return 30000ms. Accepts
   * seconds (e.g. "30s"), minutes (e.g. "5m"), hours (e.g. "6h") and
   * days (e.g. "30d")
   */
  windowDuration(w) {
    // window should be two parts, a number and a letter if it's a
    // range based index, e.g "1h".
    var regex = /([0-9]+)([smhd])/;
    var parts = regex.exec(w);

    if (parts && parts.length >= 3) {
      var num = parseInt(parts[1], 10);
      var unit = parts[2];
      return num * units[unit].length * 1000;
    }
  },

  windowPositionFromDate(w, date) {
    var duration = this.windowDuration(w);

    var dd = _moment.default.utc(date).valueOf();

    return parseInt(dd /= duration, 10);
  },

  rangeFromIndexString(index, utc) {
    var isUTC = !_underscore.default.isUndefined(utc) ? utc : true;
    var parts = index.split("-");
    var beginTime;
    var endTime;

    switch (parts.length) {
      case 3:
        // A day, month and year e.g. 2014-10-24
        if (!_underscore.default.isNaN(parseInt(parts[0], 10)) && !_underscore.default.isNaN(parseInt(parts[1], 10)) && !_underscore.default.isNaN(parseInt(parts[2], 10))) {
          var _year = parseInt(parts[0], 10);

          var month = parseInt(parts[1], 10);
          var day = parseInt(parts[2], 10);
          beginTime = isUTC ? _moment.default.utc([_year, month - 1, day]) : (0, _moment.default)([_year, month - 1, day]);
          endTime = isUTC ? _moment.default.utc(beginTime).endOf("day") : (0, _moment.default)(beginTime).endOf("day");
        }

        break;

      case 2:
        // Size should be two parts, a number and a letter if it's a
        // range based index, e.g 1h-23478
        var rangeRegex = /([0-9]+)([smhd])/;
        var sizeParts = rangeRegex.exec(parts[0]);

        if (sizeParts && sizeParts.length >= 3 && !_underscore.default.isNaN(parseInt(parts[1], 10))) {
          var pos = parseInt(parts[1], 10);
          var num = parseInt(sizeParts[1], 10);
          var unit = sizeParts[2];
          var length = num * units[unit].length * 1000;
          beginTime = isUTC ? _moment.default.utc(pos * length) : (0, _moment.default)(pos * length);
          endTime = isUTC ? _moment.default.utc((pos + 1) * length) : (0, _moment.default)((pos + 1) * length); // A month and year e.g 2015-09
        } else if (!_underscore.default.isNaN(parseInt(parts[0], 10)) && !_underscore.default.isNaN(parseInt(parts[1], 10))) {
          var _year2 = parseInt(parts[0], 10);

          var _month = parseInt(parts[1], 10);

          beginTime = isUTC ? _moment.default.utc([_year2, _month - 1]) : (0, _moment.default)([_year2, _month - 1]);
          endTime = isUTC ? _moment.default.utc(beginTime).endOf("month") : (0, _moment.default)(beginTime).endOf("month");
        }

        break;
      // A year e.g. 2015

      case 1:
        var year = parts[0];
        beginTime = isUTC ? _moment.default.utc([year]) : (0, _moment.default)([year]);
        endTime = isUTC ? _moment.default.utc(beginTime).endOf("year") : (0, _moment.default)(beginTime).endOf("year");
        break;
    }

    if (beginTime && beginTime.isValid() && endTime && endTime.isValid()) {
      return new _timerange.default(beginTime, endTime);
    } else {
      return undefined;
    }
  },

  /**
   * Returns a nice string for the index. If the index is of the form
   * 1d-2345 then just that string is returned (there's not nice way to put
   * it), but if it represents a day, month, or year (e.g. 2015-07) then a
   * nice string like "July" will be returned. It's also possible to pass in
   * the format of the reply for these types of strings. See moment's format
   * naming conventions:
   * http://momentjs.com/docs/#/displaying/format/
   */
  niceIndexString(index, format) {
    var t;
    var parts = index.split("-");

    switch (parts.length) {
      case 3:
        if (!_underscore.default.isNaN(parseInt(parts[0], 10)) && !_underscore.default.isNaN(parseInt(parts[1], 10)) && !_underscore.default.isNaN(parseInt(parts[2], 10))) {
          var _year3 = parseInt(parts[0], 10);

          var month = parseInt(parts[1], 10);
          var day = parseInt(parts[2], 10);
          t = _moment.default.utc([_year3, month - 1, day]);

          if (format) {
            return t.format(format);
          } else {
            return t.format("MMMM Do YYYY");
          }
        }

        break;

      case 2:
        var rangeRegex = /([0-9]+)([smhd])/;
        var sizeParts = rangeRegex.exec(parts[0]);

        if (sizeParts && sizeParts.length >= 3 && !_underscore.default.isNaN(parseInt(parts[1], 10))) {
          return index;
        } else if (!_underscore.default.isNaN(parseInt(parts[0], 10)) && !_underscore.default.isNaN(parseInt(parts[1], 10))) {
          var _year4 = parseInt(parts[0], 10);

          var _month2 = parseInt(parts[1], 10);

          t = _moment.default.utc([_year4, _month2 - 1]);

          if (format) {
            return t.format(format);
          } else {
            return t.format("MMMM");
          }
        }

        break;

      case 1:
        var year = parts[0];
        t = _moment.default.utc([year]);

        if (format) {
          return t.format(format);
        } else {
          return t.format("YYYY");
        }

        break;
    }

    return index;
  },

  isMissing(val) {
    return _underscore.default.isNull(val) || _underscore.default.isUndefined(val) || _underscore.default.isNaN(val);
  },

  /**
   * Split the field spec if it is not already a list.
   *
   * Also, allow for deep fields to be passed in as a tuple because
   * it will need to be used as a dict key in some of the processor
   * Options.
   *
   * This is deployed in Event.get() to process anything passed
   * to it, but this should also be deployed "upstream" to avoid
   * having that split() done over and over in a loop.
   */
  fieldPathToArray(fieldSpec) {
    if (_underscore.default.isArray(fieldSpec) || _underscore.default.isFunction(fieldSpec)) {
      return fieldSpec;
    } else if (_underscore.default.isString(fieldSpec)) {
      return fieldSpec.split(".");
    } else if (_underscore.default.isUndefined(fieldSpec)) {
      return ["value"];
    }
  },

  /**
   * Generate a list of all possible field paths in an object. This is
   * for to determine all deep paths when none is given.
   */
  generatePaths(newData) {
    var paths = [];

    function* recurse(data) {
      var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (_underscore.default.isObject(data)) {
        for (var key of Object.keys(data)) {
          for (var path of recurse(data[key], [...keys, key])) {
            yield path;
          }
        }
      } else {
        yield keys;
      }
    }

    for (var key of recurse(newData)) {
      paths.push(key);
    }

    return paths;
  },

  //
  // Functions to turn constructor args
  // into other stuff
  //
  timestampFromArg(arg) {
    if (_underscore.default.isNumber(arg)) {
      return new Date(arg);
    } else if (_underscore.default.isString(arg)) {
      return new Date(+arg);
    } else if (_underscore.default.isDate(arg)) {
      return new Date(arg.getTime());
    } else if (_moment.default.isMoment(arg)) {
      return new Date(arg.valueOf());
    } else {
      throw new Error("Unable to get timestamp from ".concat(arg, ". Should be a number, date, or moment."));
    }
  },

  timeRangeFromArg(arg) {
    if (arg instanceof _timerange.default) {
      return arg;
    } else if (_underscore.default.isString(arg)) {
      var [begin, end] = arg.split(",");
      return new _timerange.default([+begin, +end]);
    } else if (_underscore.default.isArray(arg) && arg.length === 2) {
      return new _timerange.default(arg);
    } else {
      throw new Error("Unable to parse timerange. Should be a TimeRange. Got ".concat(arg, "."));
    }
  },

  indexFromArgs(arg1) {
    var arg2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (_underscore.default.isString(arg1)) {
      return new _index.default(arg1, arg2);
    } else if (arg1 instanceof _index.default) {
      return arg1;
    } else {
      throw new Error("Unable to get index from ".concat(arg1, ". Should be a string or Index."));
    }
  },

  dataFromArg(arg) {
    var data;

    if (_underscore.default.isObject(arg)) {
      // Deeply convert the data to Immutable Map
      data = new _immutable.default.fromJS(arg);
    } else if (data instanceof _immutable.default.Map) {
      // Copy reference to the data
      data = arg;
    } else if (_underscore.default.isNumber(arg) || _underscore.default.isString(arg)) {
      // Just add it to the value key of a new Map
      // e.g. new Event(t, 25); -> t, {value: 25}
      data = new _immutable.default.Map({
        value: arg
      });
    } else {
      throw new Error("Unable to interpret event data from ".concat(arg, "."));
    }

    return data;
  }

};
exports.default = _default;