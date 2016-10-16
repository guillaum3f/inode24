module.exports = function(app,config,scripts) {

    app.get('/', function(req, res) {
        res.send('It Works!');
    });

};

