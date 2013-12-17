var memSvr = require('../server/memServer'),
    path = require('path'),
    ejs = require('ejs'),
    fs = require('fs'),
    util = require('../util/');

var controller = exports = module.exports = function() {
};

controller.prototype.init = function(req, res) {
    this.req = req;
    this.res = res;
};

controller.prototype.get = function(key) {
    return this.req.get(key);
};

controller.prototype.post = function(key) {
    if (!this.req.hasOwnProperty('post')) {
        return null;
    }
    return this.req.post(key);
};

controller.prototype.request = function(key) {
    if (key === undefined) {
        return util.merge(this.get(), this.post());
    }
    return this.req.get(key) || this.req.post(key);
};

controller.prototype.assign = function(key, val) {
    if (!this.assignData) {
        this.assignData = {};
    }
    this.assignData[key] = val;
};

controller.prototype.display = function() {
    var viewFile = path.join(memSvr.get('config').appPath, memSvr.get('config').viewDir,
    this.req.body.module, this.req.body.action + ".html");
    var self = this;
    fs.exists(viewFile, function(exists) {
        if (!exists) {
            self.res.notFound();
            return;
        }
        fs.readFile(viewFile, "utf8", function(err, data) {
            if (err) {
                self.res.error(err);
                return;
            }
            if (!self.assignData) {
                self.assignData = {};
            }
            var ret = ejs.render(data, self.assignData);
            self.res.send(ret);
        });
    });
};

controller.prototype.json = function(data) {
    if (data) {
        this.assignData = data;
    }
    if (!this.assignData) {
        this.assignData = {};
    }
    this.res.setHeader('Content-Type', "application/json");
    this.res.send(JSON.stringify(this.assignData));
};

controller.prototype.render = function(template) {
    var viewFile = path.join(memSvr.get('config').appPath, memSvr.get('config').viewDir,
    template + ".html");
    var self = this;
    fs.exists(viewFile, function(exists) {
        if (!exists) {
            self.res.notFound();
            return;
        }
        fs.readFile(viewFile, "utf8", function(err, data) {
            if (err) {
                self.res.error(err);
                return;
            }
            if (!self.assignData) {
                self.assignData = {};
            }
            var ret = ejs.render(data, self.assignData);
            self.res.send(ret);
        });
    });
};

controller.prototype.model = function(name) {
    if (!this.req.models.hasOwnProperty(name)) {
        throw new Error("The model " + name + " not exists!");
    }
    return this.req.models[name];
};

controller.prototype.db = function() {
    return this.req.db;
};