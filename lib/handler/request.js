var path = require('path'),
    parse = require('url').parse,
    util = require('../util/');

var req = module.exports = {};

req.header = function(name) {
    switch (name = name.toLowerCase()) {
        case 'referer':
        case 'referrer':
            return this.headers.referer
                || this.headers.referrer;
        default:
            return this.headers[name];
    }
};

