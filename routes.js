module.exports = function(app,deps,scripts) {

    //app.get('/', deps['passport'].authenticate('ldapauth'), function(req, res) {
    app.get('/', function(req, res) {
        res.send('Hello World!');
    });

    app.post('/register', function(req, res) {
        //res.send('Registration!');
        console.log(deps['socket.io']);
        res.redirect('/');

    });

    app.post('/login', function(req, res) {
        res.send('Login!');
    });

};

