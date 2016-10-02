module.exports = {
	fs : {
		scripts : 'scripts',
		pages : 'pages',
		static : 'static'
	},
	network : {
	  port : 10101
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
		'auth.js',
		'login.js',
		'register.js',
	],
	api : {
		get : {
			'/' : 'index.html'
		},
		post : {
			'/' : 'main.js',
			'/login' : 'login.js',
			'/register' : 'register.js',
		}
  },
}
