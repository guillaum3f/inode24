module.exports = {
	fs : {
		scripts : 'scripts',
		pages : 'pages',
		static : 'static'
	},
	network : {
	  port : 9996
  },
	ident : {
	  number : 204
  },
	deps : [
		'express',
		'body-parser',
		'http-proxy',
		'querystring',
		'http',
		'path'
	],
	scripts : [
		'main.js',
		'auth.js'
	],
	api : {
		get : {
			'/' : 'index.html'
		},
		post : {
			'/' : 'main.js',
		}
  },
}
