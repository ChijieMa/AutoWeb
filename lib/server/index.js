var http = require('http'),
    handler = require('../handler/'),
    memSvr = require('./memServer'),
    model = require('../model/');

var server = exports = module.exports = {};

server.run = function(opts) {
    if (memSvr.get('modelable')) {
        var cb = {
            cb: function(err) {
                if (err)
                    throw new Error(err);
            },
            proto: null
        };
        model(cb);
    }

    var httpSvr = http.createServer(function(req, res) {
        var T = new handler(req, res);
        T.exec();
    });

    httpSvr.listen(memSvr.get('config').port, memSvr.get('config').host, function() {
        console.log("The server start!");
    });
};