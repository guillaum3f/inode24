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
if(config.options['enable-static-content'] === true) app.use(deps['express'].static(config.fs.static)); //serve a static app
if(config.options['enable-centralized-ldapauth'] === true) {
    require('./config/passport.js')(deps['passport']);
    app.use(deps['passport'].initialize()); //use passport
}
if(config.options['use-client-sessions'] === true) {
    app.use(deps['client-sessions']({
        cookieName: 'session', // cookie name dictates the key name added to the request object
        secret: config.global['secret-key'], // should be a large unguessable string
        duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
        activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    }));
}

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
    console.log('Error at boot, local config name "'+config.name+'" is not set in root config file (../config.json)');
    console.log('It should match one of theses hosts:'+Object.keys(config.global.address).map(function (key) { return ' '+key; }));
    console.log('Modify local config name adequatly (./config/main.json)');
    return;
}

//Start scripts at boot if required
for (var scr in config['scripts-at-boot']) {
    require('./scripts/'+config['scripts-at-boot'][scr])();
}
return;

//Start the Front server
deps['server'] = http.createServer(app); //serve user client
deps['socket.io'].listen(deps['server']);  //pass a http.Server instance
deps['server'].listen(port);  //listen
console.log('started '+port);


