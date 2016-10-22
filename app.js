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
const os = require('os');
const dns = require('dns');
const json = require('format-json');
const Console = require('console').Console;
const colors = require('colors')
const figlet = require('figlet');

var platform = {};
platform.config = require('./config.json');
platform.middlewares = {};
platform.servers = [];
platform['third-part-servers'] = [];

var middlewares_dir = __dirname+'/middlewares';
var servers_dir = __dirname+'/servers';
var third_part_servers_dir = __dirname+'/servers/third-part-servers';
var static_dir = __dirname+'/static';
var routes_dir = __dirname+'/routes';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//Logs
const logStream = fs.createWriteStream(__dirname+'/system/inode.log');
const logger = new Console(logStream,logStream);
const log = function() {
    logger.log('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.green.apply(true,arguments));
}
const warn = function() {
    logger.log('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.yellow.apply(true,arguments));
}
const error = function() {
    logger.log('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.red.apply(true,arguments));
}

figlet('Host config', function(err, ascii) {
    if (err) {
        log('Something went wrong...');
        error(err);
        return;
    }

    console.log(ascii)

    //Informations on host
    console.log(colors.white.bold('FREEMEMORY ...'+os.freemem()));
    console.log(colors.white.bold('HOMEDIR ...' + os.homedir()));
    console.log(colors.white.bold('HOSTNAME ...' + os.hostname()));
    console.log(colors.white.bold('NETWORK-INTERFACES ...' + json.plain(os.networkInterfaces())));
    console.log(colors.white.bold('ARCH ...'+os.arch()));
    //console.log(colors.white.bold('CONSTANTS ...'+ json.plain(os.constants)));
    console.log(colors.white.bold('PLATFORM ...'+os.platform()+'#'+os.release()));
    console.log(colors.white.bold('TMPDIR ...'+os.tmpdir()));
    console.log(colors.white.bold('UPTIME ...'+os.uptime()));
    console.log(colors.white.bold('CURRENT DNS ...'+dns.getServers()));
});


//Require user middlewares
fs.access(middlewares_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(middlewares_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    try {
                        platform.middlewares[path.basename(items[i],'.js')] = require(middlewares_dir+'/'+items[i]);
                        log('Success [require middleware "'+items[i]+'"] ');
                    } catch (e) {
                        error('Failure [require middleware "'+items[i]+'"] '+error);
                    }
                }
            }
        });
    }
});

//Require routes
fs.access(routes_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(routes_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    try {
                        require(routes_dir+'/'+items[i])(app,platform.config,platform.middlewares);
                        log('Success [require route "'+items[i]+'"] ');
                    } catch (e) {
                        error('Failure [require route "'+items[i]+'"] '+error);
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
                        log('Launching third-part server "'+items[i]+'"');
                        exec('node '+third_part_servers_dir+'/'+items[i], (error, stdout, stderr) => {
                            if(error) error('Failure [exec third-part server "'+items[i],+'"] '+error);
                        });
                    }
                }
            });
        }
    });
}

//Starts sub-servers
if(platform.config && platform.config.servers) {
    fs.access(servers_dir, fs.F_OK, function(err) {
        if (!err) {
            fs.readdir(servers_dir, function(err, items) {
                for (var i=0; i<items.length; i++) {
                    if(platform.config.servers[items[i]]) {
                        platform.servers.push(servers_dir+'/'+items[i]);
                        fs.access(servers_dir+'/'+items[i]+'/app.js', fs.F_OK, function(err) {
                            if (!err) {
                                var item = platform.servers.shift();
                                log('Launching sub-server "'+items+'"');
                                var cmd = 'cd '+servers_dir+'/'+item+' && npm install && node app.js&';
                                exec(cmd, (error, stdout, stderr) => {
                                    if(error) error('Failure [exec sub-server '+items[i],+']"] '+error);
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
log("Static content is served from "+static_dir);
figlet('Static Content', function(err, ascii) {
    if (err) {
        log('Something went wrong...');
        error(err);
        return;
    }

    console.log(ascii)
    console.log(colors.yellow("Static content is served from "+static_dir));
});



//Start the server
fs.access(__dirname+'/../../config.json', fs.F_OK, function(err) {
    if (!err) {
        var _config = require(__dirname+'/../../config.json');
        if(_config.servers && _config.servers[platform.config.name]) {
            platform.config.port = _config.servers[platform.config.name].split(':')[1];
            jsonfile.writeFile(__dirname+'/config.json', platform.config, {spaces: 2}, function(err) {
                if(err) err('Failure [write config]"] '+err);
            })
        }
    }

    app.listen(platform.config.port);  //listen
    log('Started inode "'+platform.config.name+'" at address localhost:'+ platform.config.port);
    figlet('Inode : '+platform.config.name, function(err, ascii) {
        if (err) {
            log('Something went wrong...');
            error(err);
            return;
        }

        console.log(ascii)
        console.log(colors.green('Started inode "'+platform.config.name+'" at address localhost:'+ platform.config.port));

    });
   
});
