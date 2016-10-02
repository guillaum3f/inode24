
//Extract configuration
var config = require('./config');
var deps = {};
var scripts = {};
var proxy = '';
var app = {};

var http = require('http');
var express = require('express'),
		    app = module.exports.app = express();

process.argv.forEach(function (val, index, array) {
      console.log('Arguments-'+index + ': ' + val);
});

//Require core libraries
for (var dep in config.deps) {
	deps[config.deps[dep]] = require(config.deps[dep]);
}

proxy = deps['http-proxy'].createProxyServer({});
app = deps['express']();
app.use(deps['body-parser'].urlencoded({ extended: false }));
app.use(deps['express'].static(config.fs.static));

//Require user scripts
for (var script in config.scripts) {
	scripts[config.scripts[script]] = require(__dirname + '/' + config.fs.scripts+'/'+config.scripts[script]);
}

//Build GET router
function makeGETHandler(way) {
    return function(req, res) {
        res.sendFile(__dirname + '/' + config.fs.pages + '/' + config.api['get'][way]);
    };
}
for (var way in config.api['get']) {
	console.log('HTTP GET '+way);
    app.get(way,makeGETHandler(way));
}

//Build POST router
function makePOSTHandler(route) {
    return function(req, res) {
        scripts[config.api['post'][route]](req,res);
    };
}
for (var route in config.api['post']) {
	  console.log('HTTP POST '+route);
      app.post(route,makePOSTHandler(route));
}

var server = http.createServer(app);
var io = require('socket.io').listen(server);  //pass a http.Server instance
server.listen(config.network.port);  //listen
console.log('started '+config.network.port);

