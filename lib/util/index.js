
var util = exports = module.exports = {};

util.parseQuery = function(str, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};

    if (typeof str != 'string' || str.length == 0) {
        return obj;
    }

    var strArr = str.split(sep);
    var len = strArr.length;
    for (var i = 0; i < len; i++) {
        var idx = strArr[i].indexOf(eq),
            k, v;
        if (idx > 0) {
            k = strArr[i].substr(0, idx);
            v = strArr[i].substr(idx + 1);
        } else {
            k = strArr[i];
            v = '';
        }
        obj[k] = v;
    }
    return obj;
};

util.merge = function(a, b) {
    if (a && b) {
        for (var key in b) {
            a[key] = b[key];
        }
    }
    return a;
};