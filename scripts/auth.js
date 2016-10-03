var contact = require('./contact.js');

module.exports = function (req, res, next) {

    req.username = "toto2@toto2";
    req.password = "carotte";
        contact('192.168.1.62:3030','/login','post',req,function(data) {
            res.send(data);
        }, function(error) {
            res.status(500).send('<h1>SORRY! </h1>Registration unavailable!');
        });


}
