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

//Require user scripts
var scripts = {};
fs.readdir(config.fs.scripts, function(err, items) {
    if(err) throw err;
    for (var i=0; i<items.length; i++) {
        scripts[items[i].substr(0,items[i].lastIndexOf("."))] = require(__dirname + '/' + config.fs.scripts+'/'+items[i]);
    }
    //Require routes
    require('./routes.js')(app,deps,scripts);
});

//Optional
require('./config/passport.js')(deps['passport']);
app.use(deps['passport'].initialize()); //use passport

// Create a simple server
var server = net.createServer(function (conn) {
    console.log("Backend: Client connected");

    // If connection is closed
    conn.on("end", function() {
        console.log('Backend: Client disconnected');
    });

    // Handle data from client
    conn.on("data", function(data) {
        data = JSON.parse(data);

        switch (data.scope) {
            case 'register':
                conn.write(
                        JSON.stringify(
                            { scope: data.scope, response: 'registration ok' }
                            )
                        );
                break;

            case 'login':
                conn.write(
                        JSON.stringify(
                            { scope: data.scope, response: 'login ok' }
                            )
                        );
                break;
            
            default:
                break;
        }

    });

});

// Listen for connections
server.listen(config.network.port, "localhost", function () {
    console.log("Server: Listening at "+config.network.port);
});
