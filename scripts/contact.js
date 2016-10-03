var http = require('http');
var querystring = require('querystring');

module.exports = function (host,port,url,method,request,callback) {

        var data = '';

        var post_data = querystring.stringify(request.body);

        // An object of options to indicate where to post to
        var post_options = {
            host: host,
            port: port,
            path: url,
            method: method,
        };

        if(method.toLowerCase() === 'post') {
            post_options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        }

        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function (chunk) {
                callback(data);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();

}
