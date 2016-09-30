
//Extract configuration
var config = require('./config');
var deps = {};
var scripts = {};
var proxy = '';
var app = {};

var http = require('http');
var express = require('express'),
		    app = module.exports.app = express();

//Require core libraries
for (dep in config.deps) {
	deps[config.deps[dep]] = require(config.deps[dep]);
}

proxy = deps['http-proxy'].createProxyServer({});
app = deps['express']();
app.use(deps['body-parser'].urlencoded({ extended: false }));
app.use(deps['express'].static(config.fs.static));

//Require user scripts
for (script in config.scripts) {
	scripts[config.scripts[script]] = require(__dirname + '/' + config.fs.scripts+'/'+config.scripts[script]);
}

//Build GET router
for (way in config.api['get']) {
	  console.log('HTTP GET '+way);
		app.get(way,function(req,res){
			res.sendFile(__dirname + '/' + config.fs.pages + '/' + config.api['get'][way]);
		});
}

//Build POST router
for (route in config.api['post']) {
	  console.log('HTTP POST '+route);
	  for (script in config.api['post'][route]) {
		  app.post(route,function(req,res){
			  scripts[config.api['post'][route]](req,res);
		  });
	  }
}

var server = http.createServer(app);
var io = require('socket.io').listen(server);  //pass a http.Server instance
server.listen(config.network.port);  //listen
console.log('started '+config.network.port);

