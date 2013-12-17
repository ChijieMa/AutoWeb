var application = require('./application'),
    controller = require('./controller/');


var autoWeb = module.exports = {};

autoWeb.version = "0.0.1";

autoWeb.createApp = function(opts) {
    var app = application;
    app.init(opts);
    return app;
};

autoWeb.controller = controller;