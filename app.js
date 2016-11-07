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
const spawn = require('child_process').spawn;
const os = require('os');
const dns = require('dns');
const json = require('format-json');
const Console = require('console').Console;
const colors = require('colors')
const figlet = require('figlet');
const extfs = require('extfs');
const request = require('request');

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
var use_dir = __dirname+'/use';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var display = function(name,callback, title) {
    
    var font = (title) ? 'Standard' : 'Digital';
    figlet(name, font, function(err, ascii) {
        if (err) {
            log('Something went wrong...');
            error(err);
            return;
        }

        if(title) { 
            console.log(ascii)
        } else {
            console.log(name);
            callback();
        }
    });
}

//Logs
const logStream = fs.createWriteStream(__dirname+'/system/inode.log');
const logger = new Console(logStream,logStream);
const log = function() {
    logger.log('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.green.apply(true,arguments));
}
const warn = function() {
    logger.warn('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.yellow.apply(true,arguments));
}
const error = function() {
    logger.error('['+new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+']',colors.red.apply(true,arguments));
}

figlet('Host config', 'Standard', function(err, ascii) {
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
var middlewares = [];
fs.access(middlewares_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(middlewares_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    var item = items[i];
                    middlewares.push(items[i]);
                    try {
                        platform.middlewares[path.basename(item,'.js')] = require(middlewares_dir+'/'+item);
                        log('Success [require middleware "'+item+'"] ');
                        display('Middleware', function() {
                            console.log(colors.green("Middleware found : "+middlewares.shift()));
                        });
                    } catch (e) {
                        error('Failure [require middleware "'+item+'"] '+e);
                        display('Middleware', function() {
                            console.log(colors.red("Middleware error : "+middlewares.shift()));
                        });
                    }
                }
            }
        });
    }
});

//Require routes
var routes = [];
fs.access(routes_dir, fs.F_OK, function(err) {
    if (!err) {
        fs.readdir(routes_dir, function(err, items) {
            for (var i=0; i<items.length; i++) {
                if(path.extname(items[i]) === '.js') {
                    var item = items[i];
                    routes.push(items[i]);
                    try {
                        require(routes_dir+'/'+item)(app,platform.config,platform.middlewares);
                        log('Success [require route "'+item+'"] ');
                        display('Route', function() {
                            console.log(colors.green("Route found : "+routes.shift()));
                        });
                    } catch (e) {
                        error('Failure [require route "'+item+'"] '+e);
                        display('Route', function() {
                            console.log(colors.red("Route error : "+routes.shift()));
                        });
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
                    var item = items[i];
                    if(platform.config['third-part-servers'].indexOf(item) > -1){
                        log('Launching third-part server "'+item+'" (unknown port, look in "'+third_part_servers_dir+'/'+item+'")');
                        display('Third-part servers', function() {
                            console.log(colors.green("Third-part server found : "+item));
                        });
                        exec('node '+third_part_servers_dir+'/'+items[i], (err, stdout, stderr) => {
                            if(err) error('Failure [exec third-part server "'+item+'"] '+err);
                            console.log(colors.red('Failure [exec third-part server "'+item+'"] '));
                        });
                    }
                }
            });
        }
    });
}

//Starts sub-servers
var p_list = [];
if(platform.config && platform.config.servers) {
    fs.access(servers_dir, fs.F_OK, function(err) {
        if (!err) {
            fs.readdir(servers_dir, function(err, items) {
                var cmd = {};
                for (var i=0; i<items.length; i++) {
                    if(platform.config.servers[items[i]]) {
                            (function(i) {

                                //var child = exec('cd '+servers_dir+'/'+items[i]+' && node app.js');
                                var child = exec('cd '+servers_dir+'/'+items[i]+' && node app.js');

                                // Add the child process to the list for tracking
                                p_list.push({process:child, content:""});

                                // Listen for any response:
                                child.stdout.on('data', function (data) {
                                    console.log(colors.green(data));
                                    p_list[i].content += data;
                                });

                                // Listen for any errors:
                                child.stderr.on('data', function (data) {
                                    console.log(colors.red(child.pid, data));
                                    p_list[i].content += data;
                                }); 

                                // Listen if the process closed
                                child.on('close', function(exit_code) {
                                    console.log('Closed before stop: Closing code: ', exit_code);
                                });

                            }(i));
                    }
                }
            });
        }
    });
}

//Enable static content
extfs.isEmpty(static_dir, function (empty) {

    display('Static Content', function() {
        if (!platform.config['static-content-enabled']){
            log("Static content is deactivated. No static content served");
            console.log(colors.green("Static content is deactivated. No static content served"));
        } else if(empty && platform.config['static-content-enabled']) {
            warn("Static content is activated but Static folder is empty. No static content served from "+static_dir);
            console.warn(colors.yellow("Static content is activated but Static folder is empty. No static content served from "+static_dir));
        } else {
            app.use(express.static(platform.config['static-root'], {
                index: platform.config['static-entry-point']
            })); //serve a static app
            log("Static content is served from "+platform.config['static-root']);
            console.log(colors.green("Static content is served from "+platform.config['static-root']));
        }
    });

});

//Start the server
function start() {
    app.listen(platform.config.port);  //listen
    log('Started inode "'+platform.config.name+'" at address localhost:'+ platform.config.port);
    display('Inode : '+platform.config.name, function() {
        console.log(colors.green('Started inode "'+platform.config.name+'" at address localhost:'+ platform.config.port));
    },true);

}

fs.access(__dirname+'/../../config.json', fs.F_OK, function(err) {
    if (!err) {
        var _config = require(__dirname+'/../../config.json');
        if(_config.servers && _config.servers[platform.config.name]) {
            platform.config.port = _config.servers[platform.config.name].split(':')[1];
            jsonfile.writeFile(__dirname+'/config.json', platform.config, {spaces: 2}, function(err) {
                if(err) error('Failure [write config]"] '+err);
                start();
            })
        } else {
            start();
        }
    } else {
        start();
    }

   
});
