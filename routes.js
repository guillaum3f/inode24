module.exports = function(app,deps,scripts,sock) {

    //app.get('/', deps['passport'].authenticate('ldapauth'), function(req, res) {
    app.get('/', function(req, res) {
        res.send('Hello World!');
    });

    app.post('/register', function(req, res) {
        var ref = sock['backend'].storage;
        sock['backend'].write(JSON.stringify({scope:'register',response:req.body}), function() {
            console.log('waiting backend answer...');
            var intv = setInterval(function() {
                if(ref !== sock['backend'].storage) {
                    res.send(sock['backend'].storage);
                    console.log('backend answer received');
                    clearInterval(intv);
                }
            },100);
        });
    });

    app.post('/login', function(req, res) {
        var ref = sock['backend'].storage;
        sock['backend'].write(JSON.stringify({scope:'login',response:req.body}), function() {
            console.log('waiting backend answer...');
            var intv = setInterval(function() {
                if(ref !== sock['backend'].storage) {
                    res.send(sock['backend'].storage);
                    console.log('backend answer received');
                    clearInterval(intv);
                }
            },100);
        });
    });

};

