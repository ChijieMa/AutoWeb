/**
 * 内存服务器
 */

var memServer = function config() {
    var configList = {};

    this.set = function(k, v) {
        configList[k] = v;
    };

    this.get = function(k) {
        return configList[k] || null;
    };
};

memServer.instance = null;

memServer.getInstance = function() {
    if (this.instance === null) {
        this.instance = new memServer();
    }
    return this.instance;
};

exports = module.exports = memServer.getInstance();
