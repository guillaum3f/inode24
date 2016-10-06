const passport = require('passport');

module.exports = function(app,config,scripts) {

    var address = config.global.address;

    app.post('/remote-register', function(req, res) {
        scripts.contact(address.authserv,'/register','post',req,function(data) {
            res.send(data);
        }, function(error) {
            res.status(500).send('<h1>SORRY! </h1>Registration unavailable!');
        });
    });

    app.post('/remote-login', function(req, res) {
        scripts.contact(address.authserv,'/login','post',req,function(data) {
            res.send(data);
        }, function(error) {
            res.status(500).send('<h1>SORRY! </h1>Login unavailable!');
        });
    });

    app.post('/login', scripts.retrieve_UID, passport.authenticate('ldapauth', {session: false}), function(req, res) {
        res.send('you are logged');
    });

    app.post('/register', function(req, res) {
        scripts.register(req, config, function(answer) {
            if(answer === true) {
                res.end(req.body.email+' has been successfully registered. Welcome!');
            } else {
                res.end('Sorry, '+req.body.email+' is not available');
            }
        });
    });

};

