module.exports = function(app, config, middlewares) {

	app.get("/_routes", middlewares["list-inode-routes"], function(req, res) {

		res.end();
	});

};
