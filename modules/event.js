
var moment = require("moment");
var _ = require("underscore");

class Event {

    constructor(timestamp, data) {
        if (_.isDate(timestamp)) {
            this._t = new Date(timestamp.getTime());
        } else if (moment.isMoment(timestamp)) {
            this._t = new Date(timestamp.valueOf());
        }
        this._d = data || 0;
    }

    toUTCString() {
        return this.index() + ": " + this._t.toUTCString() + ": " + this._d;
    }

    toLocalString() {
        return this.index() + ": " + this._t.toString() + ": " + this._d;
    }

    timestamp() {
        return this._t;
    }

    data() {
        return this._d;
    }
}

module.exports = Event;
