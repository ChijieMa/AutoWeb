var parse = require('url').parse,
    path = require('path'),
    util = require('../util/'),
    response = require('./response'),
    request = require('./request'),
    memSvr = require('../server/memServer'),
    fileSvr = require('../server/fileServer'),
    mime = require('mime'),
    fs = require('fs'),
    model = require('../model/');

var handler = function(req, res) {
    this.req = util.merge(req, request);
    this.res = util.merge(res, response);
};

handler.prototype.exec = function() {
    var body = {};
    var parseObj = parse(this.req.url);
    var pathname = path.normalize(parseObj.pathname.replace(/\.\./g, '')).substr(1).replace(/\\$/g, '').replace(/\/$/g, '');
    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : null;
    body.ext = ext;
    body.path = pathname;
    if (ext != null) {
        this.req.body = body;
        this.reflect();
        return;
    }

    var query = parseObj.query;
    var pathArr = [];
    if (pathname) {
        pathArr = pathname.split(path.sep);
    }
    var len = pathArr.length;
    body.module = "Index";
    body.action = "Index";

    var keyArr = [];
    var valArr = [];
    for (var i = 0; i < len; i++) {
        if (i == 0) {
            var lastIdx = pathArr[i].lastIndexOf('_') + 1;
            var module = pathArr[i].substr(0, lastIdx) + pathArr[i].substr(lastIdx, 1).toLocaleUpperCase() +
                pathArr[i].substr(lastIdx + 1);
            body.module = module.replace('_', path.sep);
            continue;
        }
        if (i == 1) {
            body.action = pathArr[i].substr(0, 1).toLocaleUpperCase() + pathArr[i].substr(1);
            continue;
        }
        if (i % 2 == 0) {
            //请求的KEY
            keyArr.push(pathArr[i]);
        } else {
            //请求的VALUE
            valArr.push(pathArr[i]);
        }
    }
    this.req.body = body;

    var getMap = null;
    this.req.get = function(key) {
        if (!getMap) {
            var _map = {};
            var len = keyArr.length;
            for (var i = 0; i < len; i++) {
                _map[keyArr[i]] = valArr[i] || '';
            }
            var queryObj = util.parseQuery(query);
            getMap = util.merge(_map, queryObj);
        }
        if (key === undefined) {
            return getMap;
        } else {
            return getMap[key] || null;
        }
    };

    if (this.req.method.toLowerCase() == 'get') {
        this.reflect();
        return;
    }

    var self = this;
    var chunk = '';
    var postMap = null;
    this.req.on('data', function(data) {
        chunk += data;
    });
    this.req.on('end', function() {
        self.req.postData = chunk;
        self.req.post = function(key) {
            if (!postMap) {
                postMap = util.parseQuery(chunk);
            }
            if (key === undefined) {
                return postMap;
            } else {
                return postMap[key] || null;
            }
        };
        self.reflect();
    });
};

handler.prototype.reflect = function() {
    if (this.req.body.ext != null) {
        this.res.setHeader('Content-Type', mime.lookup(this.req.body.ext) + "; charset=" + memSvr.get('config').charset);
        //静态文件服务器
        var file = path.join(memSvr.get('config').filePath, this.req.body.path);
        fileSvr.init(file, this.req, this.res);
        fileSvr.exec();
    } else {
        //逻辑服务器
        if (memSvr.get('modelable')) {
            var cb = {
                cb: this.modelCallback,
                proto: this
            }
            model(cb);
        } else {
            this.invoke();
        }
    }
};

handler.prototype.modelCallback = function(err, cb) {
    if (err)
        throw new Error(err);

    this.__proto__ = cb.proto;
    this.req.models = cb.db.models;
    this.req.db = cb.db;
    this.invoke();
};

handler.prototype.invoke = function() {
    this.res.setHeader("Content-Type", "text/html; charset="+ memSvr.get('config').charset);
    var ctrFile = path.join(memSvr.get('config').appPath, memSvr.get('config').controlDir,
        this.req.body.module + "Controller.js");
    var self = this;
    fs.exists(ctrFile, function(exists) {
        if (!exists) {
            self.res.notFound();
            return;
        }
        var reflectClass = require(ctrFile);
        var reflect = new reflectClass();
        var action = self.req.body.action + "Action";
        if (typeof reflect[action] != 'function') {
            self.res.notFound();
            return;
        }
        reflect.init(self.req, self.res);
        reflect[action].apply(reflect);
    });
}

exports = module.exports = handler;