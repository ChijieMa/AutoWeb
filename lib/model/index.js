var orm = require('orm'),
    fs = require('fs'),
    path = require('path');
    memSvr = require('../server/memServer');

var connection = null;

function setup(db, cb) {
    var modelDir = path.join(memSvr.get('config').appPath, memSvr.get('config').modelDir);

    function initDb(dir) {
        fs.stat(dir, function(err, stats) {
            if (err)
                return cb.cb(err);

            if (stats.isDirectory()) {
                fs.readdir(dir, function(err, files) {
                    if (err)
                        return cb.cb(err);

                    if (Array.isArray(files)) {
                        files.forEach(function(file) {
                            initDb(path.join(dir, file));
                        });
                    } else {
                        for (var i in files) {
                            initDb(path.join(dir, files[i]))
                        }
                    }
                });
                initDb(dir);
            } else {
                require(dir)(orm, db);
            }
        });
    }
    initDb(modelDir);
    cb.db = db;
    return cb.cb(null, cb);
}

module.exports = function(cb) {
    if (connection) {
        cb.db = connection;
        return cb.cb(null, cb);
    }

    orm.connect(memSvr.get('config').db, function(err, db) {
        if (err)
            return cb.cb(err);

        connection = db;

        db.settings.set('instance.returnAllErrors', true)
        setup(db, cb);
    });
};