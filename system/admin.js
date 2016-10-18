var inquirer = require('inquirer');
var jsonfile = require('jsonfile')
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
const exec = require('child_process').exec;

var server = [
{
    type: 'input',
    name: 'name',
    message: 'server name?*',
    required: true
},
{
    type: 'input',
    name: 'demiddlewareion',
    message: 'Demiddlewareion?',
    required: false
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?*',
    required: true
},
{
    type: 'input',
    name: 'owner',
    message: 'Owner?',
    required: false
},
{
    type: 'input',
    name: 'host',
    message: 'Host and Port Number?* [i.e localhost:8763] ',
    required: true
},
{
    type: 'input',
    name: 'config',
    message: 'Global config file to use?*',
    required: true
}
];

var third_part_server = [
{
    type: 'input',
    name: 'name',
    message: 'server name?*',
    required: true
},
{
    type: 'input',
    name: 'demiddlewareion',
    message: 'Demiddlewareion?',
    required: false
},
{
    type: 'input',
    name: 'owner',
    message: 'Owner?*',
    required: true
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?*',
    required: true
},
{
    type: 'input',
    name: 'config',
    message: 'Global config file to use?*',
    required: true
},
{
    type: 'input',
    name: 'editor',
    message: 'Your favorite code editor?*',
    required: true
}
];



var functionality = [
{
    type: 'input',
    name: 'name',
    message: 'Functionality name?*',
    required: true
},
{
    type: 'input',
    name: 'demiddlewareion',
    message: 'Demiddlewareion?',
    required: false
},
{
    type: 'input',
    name: 'developper',
    message: 'Developper?*',
    required: true
},
{
    type: 'input',
    name: 'licence',
    message: 'Licence?*',
    required: true
},
{
    type: 'input',
    name: 'editor',
    message: 'Your favorite code editor?*',
    required: true
}
];

function back_to_main(message) {
    console.log('\n****'+message+'****\n');
    main();
}

function main() {
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What do you want to do?',
        choices: [
            "Add a server (node)",
            "Add a third-part-server",
            "Add a functionality",
                "Add a route",
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
                            _config.demiddlewareion = resp.demiddlewareion;
                            _config.licence = resp.licence;
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

                    exec('echo "/*Name : '+resp.name+'\nDemiddlewareion : '+resp.demiddlewareion+'\nLicence : '+resp.licence+'*/\n" > '+__dirname+'/../servers/third-part-servers/'+resp.name+'.js', (error, stdout, stderr) => {

                        console.log('Execute '+resp.editor+' '+__dirname+'/../servers/third-part-servers/'+resp.name+'.js'); 

                    });

                });

                break;

            case 'Add a functionality':

                inquirer.prompt(functionality).then(function(resp) {

                    fs.writeFile(__dirname+'/../middlewares/'+resp.name+'.js', '/*\n'+
                        ' * Demiddlewareion : '+resp.demiddlewareion+'\n'+
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
                        back_to_main("The file was saved!\nTo edit it, execute "+resp.editor+' '+__dirname+'/../middlewares/'+resp.name+'.js');
                    }); 

                });

                break;

            case 'Add a route':

                //1)select a method (get, post, put, etc...)
                //2) ask user : does he want to expose an existing functionality or create a new one and expose it or create a singleton?
                //3)a)if expose, do expose
                //3)b)if create && expose, do create a middleware && expose
                //3)c)if singleton, do write code

                var _route = {};

                inquirer.prompt([{
                    type: 'list',
                    name: 'method',
                    message : 'select a method',
                    choices: ['get', 'post']
                }]).then(function (answers) {

                    switch(answers.method) {
                        case 'get':
                        case 'post':

                            fs.readdir(__dirname+'/../middlewares/', function (err, files) {

                                var middlewares = [];
                                for(var i=0; i<files.length; i++) {
                                    if(path.extname(files[i]) === '.js') {
                                        middlewares.push(files[i].slice(0,-3));
                                    }
                                }

                                if(middlewares.length) {

                                    inquirer.prompt([{
                                        type: 'list',
                                        name: 'target',
                                        message : 'Which functionnality do you want to expose?',
                                        paginated : true,
                                        choices: middlewares
                                    }]).then(function (answers) {

                                        _route.target = answers.target;

                                        fs.writeFile(__dirname+'/../routes/'+answers.target+'.js', ''+
                                                'module.exports = function(app, config, middlewares) {'+
                                                    '\n'+
                                                        '\n\tapp.'+_route.method+'("/'+_route.target+'", middlewares.'+_route.target+', function(req, res) {'+
                                                            '\n\t\tres.end();'+
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

                                } else {
                                    back_to_main("Sorry no functionality available.");
                                }
                            });

                            break;
                        default:
                            break;
                    }

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
