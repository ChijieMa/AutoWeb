/**
 * 文件服务器
 */
var fs = require('fs'),
    memSvr = require('./memServer'),
    zlib = require('zlib');

var FileServer = exports = module.exports = {};

FileServer.init = function(file, req, res) {
    this.file = file;
    this.req = req;
    this.res = res;
};

FileServer.exec = function() {
    var self = this;
    fs.exists(this.file, function(exists) {
        if (!exists) {
            self.res.notFound();
        } else {
            fs.stat(self.file, function(err, stats) {
                if (err) {
                    self.res.error(err);
                } else {
                    if (self.req.body.ext.match(memSvr.get('config').fileCache)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + memSvr.get('config').fileExpires * 1000);
                        self.res.setHeader("Expires", expires.toUTCString());
                        self.res.setHeader("Cache-Control", "max-age=" + memSvr.get('config').fileExpires);
                    }

                    var lastModified = stats.mtime.toUTCString();
                    var ifModifiedSince = "If-Modified-Since".toLowerCase();
                    self.res.setHeader('Last-Modified', lastModified);
                    if (self.req.get(ifModifiedSince) && lastModified == self.req.get(ifModifiedSince)) {
                        self.res.writeHead(304);
                        self.res.end();
                        return;
                    }

                    var stream = fs.createReadStream(self.file);
                    var acceptEncoding = self.req.get('accept-encoding') || "";
                    if (acceptEncoding.match(/\bgzip\b/)) {
                        self.res.setHeader("Content-Encoding", "gzip");
                        stream = stream.pipe(zlib.createGzip());
                    } else if (acceptEncoding.match(/\bdeflate\b/)) {
                        self.res.setHeader("Content-Encoding", "deflate");
                        stream = stream.pipe(zlib.createDeflate());
                    }
                    self.res.writeHead(200);
                    stream.pipe(self.res);
                }
            });
        }
    });
};