'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');
var net = require('net');
var recursive = require('recursive-readdir');
var express = require('express');
var bodyParser = require('body-parser');
const exec = require('child_process').exec;

var platform = {};
platform.config = require('./config.json');
platform.scripts = {};
platform.services = [];

var scripts_dir = __dirname+'/scripts';
var services_dir = __dirname+'/services';
var static_dir = __dirname+'/static';
var routes_file = __dirname+'/routes.js';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//Require user scripts

//Require user scripts
fs.access(scripts_dir, fs.F_OK, function(err) {
    if (!err) {
        recursive(scripts_dir, function(err, items) {
            if(err) throw err;
            if (items.length) {
                for (var i=0; i<items.length; i++) {
                    platform.scripts[path.basename(items[i],'.js')] = require(items[i]);
                }
            }
        });
    }
});

//Require routes
fs.access(routes_file, fs.F_OK, function(err) {
    if (!err) {
        require(routes_file)(app,platform);
    }
});

//Starts sub-services
fs.access(services_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(services_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
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
        });
    }
});

//Enable static content
app.use(express.static(static_dir)); //serve a static app
exec('cd '+static_dir+' && bower install', (error, stdout, stderr) => {
    if(error) console.log(error);
});


//Start the server
app.listen(platform.config.port);  //listen
console.log('started '+ platform.config.port);
