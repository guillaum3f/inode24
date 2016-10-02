module.exports = function(app,scripts) {

    app.get('/hello', scripts.auth, scripts.main, scripts.register, function(req, res) {
        res.send('look at me!');
    });

};

