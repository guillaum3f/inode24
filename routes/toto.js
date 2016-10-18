module.exports = function(app, config, middlewares) {

	app.get("/toto", middlewares.toto, function(req, res) {
		res.end();
	});

};
