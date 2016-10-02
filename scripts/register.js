module.exports = function(req,res) {

    var data = {};

    //Get registration data
    for (var item in req.body) {
        data[item] = req.body[item];
    }

    res.send(data);

}
