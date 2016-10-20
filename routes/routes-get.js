module.exports = function(app, config, middlewares) {

	app.get("/routes", middlewares["list-inode-routes"], function(req, res) {

		res.end();
	});

};