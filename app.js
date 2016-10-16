'use strict'

var this_config = process.argv[2];
var this_routes = process.argv[3];

var http = require('http');
var fs = require('fs');
var net = require('net');
var recursive = require('recursive-readdir');

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
if(this_config) config['global'] = require(this_config);

//Require core libraries
var deps = {};
for (var dep in require('./package.json').dependencies) {
	deps[dep] = require(dep);
}

var app = deps['express']();
app.use(deps['body-parser'].urlencoded({ extended: false }));

//Require user scripts
var scripts = {};
recursive(config.fs.scripts, function(err, items) {
    if(err) throw err;
    var path;
    for (var i=0; i<items.length; i++) {
        path = items[i].substr(config.fs.scripts.length+1);
        console.log('Loaded scripts : '+config.fs.scripts+'/'+path);
        scripts[path.substr(0,path.lastIndexOf("."))] = require(__dirname+'/' +items[i]);
    }
    //Require routes
    if(this_routes) require(__dirname+'/'+this_routes)(app,config,scripts);
});


//Set node identity
if(config.global.address[config.name]) {
    var port = config.global.address[config.name].split(':')[1]
        var counter = 0;
    for (var host in config.global.address) {
        counter++;
        if(host === config.name) config.ident = counter;
    }
    console.log('inode number '+config.ident);

} else {
    console.log('Error at boot, local config name "'+config.name+'" is not set in root config file ('+this_config+')');
    console.log('It should match one of theses hosts:'+Object.keys(config.global.address).map(function (key) { return ' '+key; }));
    console.log('Modify local config name adequatly (./config/main.json)');
    return;
}

//Start sub-servers at boot if required in the local config file
for (var server in config['run-subservers-at-boot']) {
    require('./'+config.fs['sub-servers']+'/'+config['run-subservers-at-boot'][server])(config);
}

//Start the Front server
deps['server'] = http.createServer(app); //serve user client
deps['socket.io'].listen(deps['server']);  //pass a http.Server instance
deps['server'].listen(port);  //listen
console.log('started '+port);


