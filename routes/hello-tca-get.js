const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

module.exports = function(app, config, middlewares) {

	app.get("/hello-tca", function(req, res) {

		proxy.web(req, res, { target: "http://localhost:9090" }, 
		function(err) { if(err) throw err; });

	});

}
