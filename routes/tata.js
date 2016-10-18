module.exports = function(app, config, middlewares) {

	app.get("/tata", middlewares.tata, function(req, res) {
		res.end();
	});

};
