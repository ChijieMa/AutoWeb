var log4js = require('log4js'),
    memSvr = require('../server/memServer');

log4js.configure(memSvr.get('config').logConfig, {});
log4js.loadAppender('file');

var logger = exports = module.exports = {};

logger.getLogger = function(log) {
    if (typeof log != 'string') {
        throw new Error('The log should be string.');
    }
    return log4js.getLogger(log);
};