var inquirer = require('inquirer');
var jsonfile = require('jsonfile')
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
    name: 'owner',
    message: 'Owner?',
    required: false
},
{
    type: 'input',
    name: 'host',
    message: 'Host and Port Number? [i.e localhost:8763]* ',
    required: true
},{
    type: 'input',
    name: 'config',
    message: 'Global config file to use?*',
    required: true
}
];


inquirer.prompt([{
  type: 'list',
  name: 'options',
  message: 'What do you want to do?',
  choices: [
      "Add a service",
      new inquirer.Separator(),
      "Quit"
  ]
}]).then(function (answers) {
        switch(answers.options) {

            case 'Add a service':

                inquirer.prompt(service).then(function(resp) {

                    var config = require(__dirname+'/'+resp.config);

                    if(!config.services) {
                        config.services = {};
                    }

                    config.services[resp.name] = resp.host;

                    var file = __dirname+'/'+resp.config;
                    jsonfile.writeFile(file, config, {spaces: 2}, function(err) {
                        console.error(err)
                    })

                    exec('git clone https://github.com/guillaum3f/inode24.git ../services/'+resp.name, (error, stdout, stderr) => {
                        if(error) console.log(error);
                        var _config = {};
                        _config.name = resp.name;
                        _config.owner = resp.owner;
                        _config.description = resp.description;
                        _config.port = resp.host.split(':')[1];
                        jsonfile.writeFile(__dirname+'/../config.json', _config, {spaces: 2}, function(err) {
                            console.error(err)
                        })

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
