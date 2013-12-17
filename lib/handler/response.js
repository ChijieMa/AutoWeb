var res = module.exports = {};

res.notFound = function() {
    this.writeHead(404);
    this.send('The request url was not found on this server.');
};

res.error = function(err) {
    this.writeHead(500);
    this.send(err);
};

res.sendFile = function(file) {
    this.writeHead(200);
    this.write(file, 'binary');
    this.end();
};


res.send = function(data) {
    this.end(data);
};