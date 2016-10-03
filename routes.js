module.exports = function(app,address,scripts) {

    app.post('/register', function(req, res) {
        scripts.contact(address.authserv,'/register','post',req,function(data) {
            res.send(data);
        }, function(error) {
            res.status(500).send('<h1>SORRY! </h1>Registration unavailable!');
        });
    });

    app.post('/login', function(req, res) {
        scripts.contact(address.authserv,'/login','post',req,function(data) {
            res.send(data);
        }, function(error) {
            res.status(500).send('<h1>SORRY! </h1>Login unavailable!');
        });
    });

};

