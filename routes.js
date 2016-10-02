module.exports = function(app,scripts) {

    app.get('/', scripts.example, function(req, res) {
        res.send('Hello World!');
    });

};

