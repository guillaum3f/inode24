module.exports = function(app, config, middlewares) {

	app.get("/_inode", middlewares["get-inode-data"], function(req, res) {

		res.end();
	});

};
