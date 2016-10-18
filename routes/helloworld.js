module.exports = function(app,config,middlewares) {

    app.get('/hello', function(req, res) {
        res.send('Hello World!');
    });

};

