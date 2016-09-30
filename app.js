//Extract configuration
var config = require('./config');
var deps = {};
var scripts = {};
var proxy = '';
var app = {};

//Require core libraries
for (dep in config.deps) {
	deps[config.deps[dep]] = require(config.deps[dep]);
}

//Require user scripts
for (script in config.scripts) {
	scripts[config.scripts[script]] = require(__dirname + '/' + config.fs.scripts+'/'+config.scripts[script]);
}

proxy = deps['http-proxy'].createProxyServer({});

app = deps['express']();
app.use(deps['body-parser'].urlencoded({ extended: false }));
app.use(deps['express'].static(config.fs.static));

//Build GET router
for (way in config.api['get']) {
		app.get(way,function(req,res){
			res.sendFile(__dirname + '/' + config.fs.pages + '/' + config.api['get'][way]);
		});
}

//Build POST router
for (route in config.api['post']) {
	for (script in config.api['post'][route]) {
		app.post(route,function(req,res){
			scripts[config.api['post'][route]](req,res);
		});
	}
}

// Load socket.io
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
	fs.readFile('./pages/index.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

var io = require('socket.io').listen(server);

// Track socket.io clients
io.sockets.on('connection', function (socket) {
   console.log('Un client est connecté !');
});
server.listen(config.network.port+1);

//Start the server
app.listen(config.network.port);
console.log("Server is listening on port "+config.network.port);


