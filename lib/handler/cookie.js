var cookie = exports = module.exports = {};

cookie.parse = function(cookieStr) {
    var pairs = cookieStr.split(/[;,] */);
    var obj = {};

    pairs.forEach(function(pair) {
        var idx = pair.indexOf('=');
        if (idx < 0) {
            return obj;
        }

        var key = pair.substr(0, idx).trim();
        var val = pair.substr(++idx).trim();

        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }

        obj[key] = val;
    });

    return obj;
};

cookie.stringify = function(cookieObj) {
    if (typeof cookieObj != 'object') {
        console.log("The argument must be object of cookie.stringify!");
        return;
    }

    var pairs = [cookieObj.key + "=" + cookieObj.value];
    if (cookieObj.maxAge) pairs.push("Max-Age=" + cookieObj.maxAge);
    if (cookieObj.expires) pairs.push("Expires=" + cookieObj.expires.toUTCString());
    if (cookieObj.path) pairs.push("Path=" + cookieObj.path);
    if (cookieObj.domain) pairs.push("Domain=" + cookieObj.domain);
    if (cookieObj.httpOnly) pairs.push("Httponly");
    if (cookieObj.secure) pairs.push("Secure");

    return pairs.join("; ");
};