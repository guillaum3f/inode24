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

//Add global configuration
config['global'] = require('../config.json');

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
    require('./routes.js')(app,config.global.address,scripts);
});

//Optional
app.use(deps['express'].static(config.fs.static)); //serve a static app
require('./config/passport.js')(deps['passport']);
app.use(deps['passport'].initialize()); //use passport

//Frontend server
var port = config.global.address[config.name].split(':')[1]
deps['server'] = http.createServer(app); //serve user client
deps['socket.io'].listen(deps['server']);  //pass a http.Server instance
deps['server'].listen(port);  //listen
console.log('started '+port);

