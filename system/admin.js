var inquirer = require('inquirer');
var jsonfile = require('jsonfile')
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
const exec = require('child_process').exec;

var service = [
{
    type: 'input',
    name: 'name',
    message: 'Service name?*',
    required: true
},
{
    type: 'input',
    name: 'description',
    message: 'Description?',
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
    message: 'Service name?*',
    required: true
},
{
    type: 'input',
    name: 'description',
    message: 'Description?',
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
    name: 'description',
    message: 'Description?',
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


inquirer.prompt([{
  type: 'list',
  name: 'options',
  message: 'What do you want to do?',
  choices: [
      "Add a paar-service",
      "Add a third-part-server",
      "Add a functionality",
      "Add a route",
      new inquirer.Separator(),
      "Quit"
  ]
}]).then(function (answers) {
        switch(answers.options) {

            case 'Add a paar-service':

                inquirer.prompt(service).then(function(resp) {

                    var config = require(__dirname+'/'+resp.config);

                    if(!config.services) {
                        config.services = {};
                    }

                    config.services[resp.name] = resp.host;

                    var file = __dirname+'/'+resp.config;
                    jsonfile.writeFile(file, config, {spaces: 2}, function(err) {
                        if(err) console.error(err)
                    })

                    exec('git clone https://github.com/guillaum3f/inode24.git ../services/'+resp.name, (error, stdout, stderr) => {
                        if(error) console.log(error);
                        var _config = {};
                        _config.name = resp.name;
                        _config.owner = resp.owner;
                        _config.description = resp.description;
                        _config.licence = resp.licence;
                        _config.port = resp.host.split(':')[1];
                        jsonfile.writeFile(__dirname+'/../services/'+resp.name+'/config.json', _config, {spaces: 2}, function(err) {
                            if(err) console.error(err)
                        })

                    });

                });

            break;

            case 'Add a third-part-server':

                mkdirp(__dirname+'/../services/third-part-servers', function(err) { 
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

                    exec('echo "/*Name : '+resp.name+'\nDescription : '+resp.description+'\nLicence : '+resp.licence+'*/\n" > '+__dirname+'/../services/third-part-servers/'+resp.name+'.js', (error, stdout, stderr) => {

                                console.log('Execute '+resp.editor+' ../services/third-part-servers/'+resp.name+'.js'); 

                    });

                });

            break;

            case 'Add a functionality':

                inquirer.prompt(functionality).then(function(resp) {

                    exec('echo "//'+resp
                            .description+'\n\nmodule.exports = function() {\n\n\n\n}\n\nLicence : "'+resp
                            .licence+' > ../scripts/'+resp
                            .name+'.js', 
                            (error, stdout, stderr) => {

                            console.log('Execute '+resp.editor+' ../scripts/'+resp.name+'.js'); 

                    });
                });

            break;

            case 'Add a route':

                fs.readdir('../scripts/', function (err, files) {

                    var scripts = [];
                    for(var i=0; i<files.length; i++) {
                        if(path.extname(files[i]) === '.js') {
                            scripts.push(files[i].slice(0,-3));
                        }
                    }

                   inquirer.prompt([{
                       type: 'list',
                       name: 'target',
                       message : 'Which functionnality do you want to expose?',
                       paginated : true,
                       choices: scripts
                   }]).then(function (answers) {
                       fs.readFile('../scripts/'+answers.target+'.js', 'utf8', function (err,data) {
                           if (err) {
                               return console.log(err);
                           }
                           console.log(data);
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
