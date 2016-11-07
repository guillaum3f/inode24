const sessions = require("client-sessions");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createServer({});

module.exports = function(app, config, middlewares) {

    app.use(sessions(config.global.cookie.auth));
    //app.use(require('connect-restreamer')());

    app.get('/marvin', function(req, res) {
        res.end('marvin');
    });

	app.all("/*", function(req, res) {

        proxy.web(req, res, { 
            target: 'http://'+config.servers['Apps']
        }, 
        function(err) { if(err) throw err;});

	});

}
