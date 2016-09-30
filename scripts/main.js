module.exports = function(req,res) {

	var message = "Response content"
	console.log(message+ ' ' +JSON.stringify(req.body));
	res.send(message+ ' ' +JSON.stringify(req.body));

}
