var path = require('path'),
    memSvr = require('./server/memServer');

var application = exports = module.exports = {};

application.init = function(opts) {
    opts.host = (opts && opts.host) || "0.0.0.0";
    opts.port = (opts && opts.port) || 3000;
    memSvr.set('config', opts);
};

application.enableModel = function() {
    memSvr.set('modelable', true);
};

application.start = function() {
    var server = require('./server/');
    server.run();
};




