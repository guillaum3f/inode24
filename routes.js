module.exports = function(app,config,scripts) {

    app.get('/hello', function(req, res) {
        res.send('Hello World!');
    });

};

