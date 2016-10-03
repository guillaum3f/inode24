module.exports = function(app,deps,scripts) {

    //app.get('/', deps['passport'].authenticate('ldapauth'), function(req, res) {
    app.get('/', function(req, res) {
        res.send('Hello World!');
    });

    app.post('/register', function(req, res) {

        scripts.contact('localhost','10101','/register','post',req,function(data) {
            res.send(data);
        });

    });

    app.post('/login', function(req, res) {
        scripts.contact('localhost','10101','/login','post',req,function(data) {
            res.send(data);
        });
    });

};

