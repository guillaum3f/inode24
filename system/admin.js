var inquirer = require('inquirer');
var jsonfile = require('jsonfile')
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var child_process = require('child_process');
var request = require('request');
const exec = require('child_process').exec;

var server = [
{
    type: 'input',
    name: 'name',
    message: 'server name?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'description',
    message: 'description?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?',
    default: 'none',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'owner',
    message: 'Owner?',
    default: 'none',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'host',
    message: 'Host and Port Number?* [i.e localhost:8763] ',
    validate: function(str){
        if(str.split(':').length === 2) {
            return true;
        }
    }
},
{
    type: 'input',
    name: 'config',
    message: 'Global config file to use?*',
    validate: function(str){
        return !!str;
    }
}
];

var third_part_server = [
{
    type: 'input',
    name: 'name',
    message: 'Server name?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'description',
    message: 'Description?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'owner',
    message: 'Owner?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?',
    default: 'none',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'config',
    message: 'Global config file to use with?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'editor',
    message: 'Your favorite code editor?',
    default: 'vim',
    validate: function(str){
        return !!str;
    }
}
];



var middleware = [
{
    type: 'input',
    name: 'name',
    message: 'Middleware name?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'description',
    message: 'Description?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'developper',
    message: 'Developper?*',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?',
    default: 'none',
    validate: function(str){
        return !!str;
    }
},
{
    type: 'input',
    name: 'editor',
    message: 'Your favorite code editor?*',
    validate: function(str){
        return !!str;
    }
}
];

function large_display(message) {
    console.log('\n**** '+message+' ****\n');
}

function back_to_main(message) {
    large_display(message);
    main();
}

function overWrite(item, callback) {

    fs.stat(item, function(err, stat) {
        if(err == null) {
            large_display('Item '+item+' exists');
            inquirer.prompt([{
                type: 'list',
                name: 'overwrite',
                message: 'Overwrite?',
                choices: ['yes','no'],
                default: 'no'
            }]).then(function (answers) {
                if(answers.overwrite === 'yes') {
                    callback();
                }
            });
        } else {
            callback();
        }
    });
}

function main() {
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What do you want to do?',
        choices: [
            "Add a server (node)",
            "Add a third-part-server",
            "Add a middleware",
            "Add a local route",
            "Add a distant route",
            new inquirer.Separator(),
            "Quit"
        ]
    }]).then(function (answers) {
        switch(answers.options) {

            case 'Add a server (node)':

                inquirer.prompt(server).then(function(resp) {

                    var config = require(__dirname+'/'+resp.config);

                    if(!config.servers) {
                        config.servers = {};
                    }

                    config.servers[resp.name] = resp.host;

                    var file = __dirname+'/'+resp.config;
                    jsonfile.writeFile(file, config, {spaces: 2}, function(err) {
                        if(err) console.error(err)
                    })

                    exec('git clone https://github.com/guillaum3f/inode24.git '+__dirname+'/../servers/'+resp.name, (error, stdout, stderr) => {
                            if(error) console.log(error);
                            var _config = {};
                            _config.name = resp.name;
                            _config.owner = resp.owner;
                            _config.description = resp.description;
                            _config.licence = resp.licence || 'none';
                            _config.port = resp.host.split(':')[1];
                            jsonfile.writeFile(__dirname+'/../servers/'+resp.name+'/config.json', _config, {spaces: 2}, function(err) {
                                if(err) console.error(err)
                            })

                            });

                });

                break;

            case 'Add a third-part-server':

                mkdirp(__dirname+'/../servers/third-part-servers', function(err) { 
                    if (err) throw err;
                });

                inquirer.prompt(third_part_server).then(function(resp) {

                    var config = require(__dirname+'/'+resp.config);

                    if(!config['third-part-servers']) {
                        config['third-part-servers'] = [];
                    }

                    config['third-part-servers'].push(resp.name+'.js');

                    var file = __dirname+'/'+resp.config;
                    jsonfile.writeFile(file, config, {spaces: 2}, function(err) {
                        if(err) console.error(err)
                    })

                    exec('echo "/*Name : '+resp.name+'\ndescription : '+resp.description+'\nLicence : '+resp.licence +'*/\n" > '+__dirname+'/../servers/third-part-servers/'+resp.name+'.js', (error, stdout, stderr) => {

                        console.log('Execute '+resp.editor+' '+__dirname+'/../servers/third-part-servers/'+resp.name+'.js'); 

                    });

                });

                break;

            case 'Add a middleware':

                inquirer.prompt(middleware).then(function(resp) {

                    overWrite(__dirname+'/../middlewares/'+resp.name+'.js', function() {
                        fs.writeFile(__dirname+'/../middlewares/'+resp.name+'.js', 
                                '/*\n'+
                                ' * description : '+resp.description+'\n'+
                                ' * Author : '+resp.developper+'\n'+
                                ' * Licence : '+resp.licence+'\n'+
                                '*/\n\n'+
                                'module.exports = function(req, res, next) {'+
                                    '\n\t'+
                                        '\n\t'+
                                        '\n\tnext();'+
                                        '\n\t'+
                                        '\n};', function(err) {
                                            if(err) {
                                                return console.log(err);
                                            }
                                            var child = child_process.spawn(resp.editor, [__dirname+'/../middlewares/'+resp.name+'.js'], {
                                                stdio: 'inherit'
                                            });

                                            child.on('exit', function (e, code) {
                                                back_to_main('The file was saved!');
                                            });
                                        }); 
                    });


                });

                break;

            case 'Add a local route':

                var _route = {};

                inquirer.prompt([{
                    type: 'list',
                    name: 'method',
                    message : 'select a method',
                    choices: ['get', 'post']
                }]).then(function (answers) {

                    _route.method = answers.method;

                    switch(answers.method) {
                        case 'get':
                        case 'post':

                            fs.readdir(__dirname+'/../middlewares/', function (err, files) {

                                var middlewares = [];
                                for(var i=0; i<files.length; i++) {
                                    if(path.extname(files[i]) === '.js') {
                                        middlewares.push({ 'name' : files[i].slice(0,-3) });
                                    }
                                }

                                if(middlewares.length) {

                                    inquirer.prompt([{
                                        type: 'checkbox',
                                        name: 'middlewares',
                                        message : 'Which middleware(s) do you want to expose?',
                                        choices: middlewares
                                    }]).then(function (answers) {

                                        _route.middlewares = answers.middlewares;

                                        for(var md in _route.middlewares) {
                                            console.log(parseInt(md,10)+1 +')'+_route.middlewares[md]);
                                        }

                                        inquirer.prompt([{
                                            type: 'input',
                                            name: 'order',
                                            message : 'Specify order?'
                                        }]).then(function (answers) {

                                            var chain = '';
                                            for(var i=0; i<answers.order.length; i++) {
                                                if(i === answers.order.length-1) {
                                                    chain += 'middlewares["'+_route.middlewares[parseInt(answers.order[i],10)-1]+'"]';
                                                } else {
                                                    chain += 'middlewares["'+_route.middlewares[parseInt(answers.order[i],10)-1]+'"]->';
                                                }
                                            }

                                            console.log(chain);
                                            _route.target = (chain.split('->')[chain.split('->').length-1]).split('.')[1];
                                            _route.targets = chain.split('->').join(', ');

                                            inquirer.prompt([{
                                                type: 'input',
                                                name: 'main',
                                                message : 'Route name?',
                                                default : _route.target 
                                            }]).then(function (answers) {

                                                overWrite(__dirname+'/../routes/'+answers.main+'-'+_route.method+'.js', function() {
                                                    fs.writeFile(__dirname+'/../routes/'+answers.main+'-'+_route.method+'.js', ''+
                                                        'module.exports = function(app, config, middlewares) {'+
                                                            '\n'+
                                                                '\n\tapp.'+_route.method+'("/'+answers.main+'", '+_route.targets+', function(req, res) {'+
                                                                    '\n\n\t\tres.end();'+
                                                                        '\n\t});'+
                                                                '\n'+
                                                                '\n};'+
                                                                '', function(err) {
                                                                    if(err) {
                                                                        return console.log(err);
                                                                    }

                                                                    back_to_main("The file was saved!");
                                                                }); 
                                                    });

                                                });
                                            });

                                    });

                                } else {
                                    back_to_main('Sorry no middleware available.');
                                }
                            });

                            break;
                        default:
                            break;
                    }

                }); 

                break;

            case 'Add a distant route':

                var _route = {};

                inquirer.prompt([{
                    type: 'input',
                    name: 'host',
                    message : 'Specify the distant host:'
                },{
                    type: 'input',
                    name: 'port',
                    message : 'Specify the port to use:'
                }]).then(function (answers) {

                    _route.host = 'http://'+answers.host+':'+answers.port;

                    request.get(_route.host+'/routes', function(error, response, body) {
                            if(error) throw error;
                            inquirer.prompt([{
                                type: 'list',
                                name: 'target',
                                message : 'Select a distant route:',
                                choices : body.split('\n')
                            }]).then(function (answers) {

                                _route.method = answers.target.split(' ')[1].toLowerCase();
                                _route.target = answers.target.split(' ')[2];

                                var mode_list=['grasp data'];
                                if(_route.method === 'get') {
                                    mode_list.push('proxify request');
                                }

                                inquirer.prompt([{
                                    type: 'list',
                                    name: 'mode',
                                    message : 'Choose a mode:',
                                    choices : mode_list
                                }]).then(function (answers) {

                                    switch(answers.mode) {
                                        case 'grasp data':

                                            inquirer.prompt([{
                                                type: 'input',
                                                name: 'local-name',
                                                message : 'Local route name?',
                                                default : _route.target
                                            },{
                                                type: 'list',
                                                name: 'local-method',
                                                message : 'select a method',
                                                default: _route.method,
                                                         choices: ['get', 'post']
                                            }]).then(function (answers) {

                                                switch(answers['local-method']) {
                                                    case 'get':
                                                        _route.data = 'req.query';
                                                        break;

                                                    case 'post':
                                                        _route.data = 'req.body';
                                                        break;

                                                    default:
                                                        _route.data = '{}';
                                                        break;
                                                }

                                                overWrite(__dirname+'/../routes/'+answers['local-name']+'-'+answers['local-method']+'.js', function() {
                                                    fs.writeFile(__dirname+'/../routes/'+answers['local-name']+'-'+answers['local-method']+'.js', ''+
                                                        'const request = require("request");\n\n'+
                                                        'module.exports = function(app, config, middlewares) {\n\n'+
                                                            '\tapp.'+answers['local-method']+'("/'+answers['local-name']+'", function(req, res) {\n\n'+
                                                                '\t\trequest({\n'+
                                                                    '\t\t\turl: "'+_route.host+'/'+_route.target+'", //URL to hit\n'+
                                                                    '\t\t\t\tqs: '+_route.data+', //Query string data\n'+
                                                                    '\t\t\t\tmethod: "'+_route.method+'",\n'+
                                                                        '\t\t\t\t//headers: {\n'+
                                                                        '\t\t\t\t//    "Content-Type": "MyContentType",\n'+
                                                                        '\t\t\t\t//    "Custom-Header": "Custom Value"\n'+
                                                                        '\t\t\t\t//},\n'+
                                                                        '\t\t\t\tbody: "Hello Hello! String body!" //Set the body as a string\n'+
                                                                        '\t\t\t}, function(error, response, body){\n'+
                                                                            '\t\t\t\tif(error) {\n'+
                                                                                '\t\t\t\t\tconsole.log(error);\n'+
                                                                                    '\t\t\t\t} else {\n'+
                                                                                        '\t\t\t\t\tres.write(body);\n'+
                                                                                            '\t\t\t\t}\n\n'+
                                                                                            '\t\t\t\tres.end();\n'+
                                                                                            '\t\t});\n'+
                                                                    '\t});\n'+
                                                                '}\n'+
                                                                '', function(err) {
                                                                    if(err) {
                                                                        return console.log(err);
                                                                    }

                                                                    back_to_main("The file was saved!");
                                                                }); 

                                                    });
                                            });

                                            break;

                                        case 'proxify request':

                                            inquirer.prompt([{
                                                type: 'input',
                                                name: 'local-name',
                                                message : 'Route name?',
                                                default : _route.target
                                            }]).then(function (answers) {

                                                switch(_route.method) {
                                                    case 'get':
                                                        _route.data = 'req.query';
                                                        break;

                                                    case 'post':
                                                        _route.data = 'req.body';
                                                        break;

                                                    default:
                                                        _route.data = '{}';
                                                        break;
                                                }

                                                var patch_request = '';
                                                var target;

                                                if(_route.target !== answers['local-name']) { 
                                                    patch_request += '\t\tvar params = (req.url.split && req.url.split("?").length === 2) ? "?"+req.url.split("?")[1] : "";\n\t\treq.url="";\n';
                                                    target = '"'+_route.host+'/'+_route.target+'"+params';
                                                } else {
                                                    target = '"'+_route.host+'"';
                                                }

                                                overWrite(__dirname+'/../routes/'+answers['local-name']+'-'+_route.method+'.js', function() {
                                                    fs.writeFile(__dirname+'/../routes/'+answers['local-name']+'-'+_route.method+'.js', ''+
                                                        'const httpProxy = require("http-proxy");\n'+
                                                        'const proxy = httpProxy.createProxyServer({});\n\n'+
                                                        'module.exports = function(app, config, middlewares) {\n\n'+
                                                        '\tapp.'+_route.method+'("/'+answers['local-name']+'", function(req, res) {\n\n'+

                                                            patch_request+
                                                            '\t\tproxy.web(req, res, { target: '+target+' }, \n'+
                                                            '\t\tfunction(err) { if(err) throw err; });\n\n'+

                                                            '\t});\n\n'+
                                                            '}\n'+
                                                            '', function(err) {
                                                                if(err) {
                                                                    return console.log(err);
                                                                }

                                                                back_to_main("The file was saved!");

                                                                }); 

                                                    });
                                            });
                                            break;

                                        default:
                                            break;
                                    }
                                });

                            });
                        });

                });
                break;

            case 'Quit':
                console.log('bye');
                break;

            default:
                break;
        }
    });
}

main();
