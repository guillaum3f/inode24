module.exports = function(req, res, next) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write('ok it works well');
    next();
}
