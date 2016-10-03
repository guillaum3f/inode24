'use strict'

var http = require('http');
var fs = require('fs');
var net = require('net');

//Extract arguments given to this script
process.argv.forEach(function (val, index, array) {
      if(index>1) {
          console.log('Arguments received!');
          console.log('Arguments-' + parseInt(index-1,10) + ': ' + val);
      }
});

//Extract configuration
var config = require('./config/main.json');

//Require core libraries
var deps = {};
for (var dep in require('./package.json').dependencies) {
	deps[dep] = require(dep);
}

var app = deps['express']();
app.use(deps['body-parser'].urlencoded({ extended: false }));

// Create a socket (client) that connects to the server
var socket = {};
socket['backend'] = new net.Socket();
socket['backend'].connect(10101, "localhost", function () {
    console.log("Frontend: Connected to Backend");
});

// Handle the data got from the distant server
socket['backend'].on("data", function (data) {
    data = JSON.parse(data);
    socket['backend'].storage = data.response;
    console.log('Received data from backend : ' + data.response);
});

//Require user scripts
var scripts = {};
fs.readdir(config.fs.scripts, function(err, items) {
    if(err) throw err;
    for (var i=0; i<items.length; i++) {
        scripts[items[i].substr(0,items[i].lastIndexOf("."))] = require(__dirname + '/' + config.fs.scripts+'/'+items[i]);
    }
    //Require routes
    require('./routes.js')(app,deps,scripts,socket);
});

//Optional
app.use(deps['express'].static(config.fs.static)); //serve a static app
require('./config/passport.js')(deps['passport']);
app.use(deps['passport'].initialize()); //use passport

//Frontend server
deps['server'] = http.createServer(app); //serve user client
deps['socket.io'].listen(deps['server']);  //pass a http.Server instance
deps['server'].listen(config.network.port);  //listen
console.log('started '+config.network.port);
