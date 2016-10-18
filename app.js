'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');
var net = require('net');
var recursive = require('recursive-readdir');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
const exec = require('child_process').exec;

var platform = {};
platform.config = require('./config.json');
platform.scripts = {};
platform.services = [];
platform['third-part-servers'] = [];

var scripts_dir = __dirname+'/scripts';
var services_dir = __dirname+'/services';
var third_part_servers_dir = __dirname+'/services/third-part-servers';
var static_dir = __dirname+'/static';
var routes_dir = __dirname+'/routes';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//Require user scripts
fs.access(scripts_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(scripts_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    try {
                        platform.scripts[path.basename(items[i],'.js')] = require(scripts_dir+'/'+items[i]);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });
    }
});

//Require routes
//fs.access(routes_file, fs.F_OK, function(err) {
//    if (!err) {
//        require(routes_file)(app,platform.config,platform.scripts);
//    }
//});

//Require routes
fs.access(routes_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(routes_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    try {
                        require(routes_dir+'/'+items[i])(app,platform.config,platform.scripts);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });
    }
});

//Starts third-part-servers
if(platform.config && platform.config['third-part-servers']) {
    fs.access(third_part_servers_dir, fs.F_OK, function(err) {
        if (!err) {
            fs.readdir(third_part_servers_dir, function(err, items) {
                for (var i=0; i<items.length; i++) {
                    if(platform.config['third-part-servers'].indexOf(items[i]) > -1){
                        exec('node '+third_part_servers_dir+'/'+items[i], (error, stdout, stderr) => {
                            if(error) console.log(error);
                        });
                    }
                }
            });
        }
    });
}

//Starts sub-services
if(platform.config && platform.config.services) {
    fs.access(services_dir, fs.F_OK, function(err) {
        if (!err) {
            fs.readdir(services_dir, function(err, items) {
                for (var i=0; i<items.length; i++) {
                    if(platform.config.services[items[i]]) {
                        platform.services.push(services_dir+'/'+items[i]);
                        fs.access(services_dir+'/'+items[i]+'/app.js', fs.F_OK, function(err) {
                            if (!err) {
                                var item = platform.services.shift();
                                exec('npm install --prefix '+item+' && node '+item+'/app.js', (error, stdout, stderr) => {
                                    if(error) console.log(error);
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

//Enable static content
app.use(express.static(static_dir)); //serve a static app


//Start the server
fs.access(__dirname+'/../../config.json', fs.F_OK, function(err) {
    if (!err) {
        var _config = require(__dirname+'/../../config.json');
        if(_config.services && _config.services[platform.config.name]) {
            platform.config.port = _config.services[platform.config.name].split(':')[1];
            jsonfile.writeFile(__dirname+'/config.json', platform.config, {spaces: 2}, function(err) {
                if(err) console.error(err)
            })
        }
    }

    app.listen(platform.config.port);  //listen
    console.log('started '+ platform.config.port);
   
});
