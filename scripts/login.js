module.exports = function(req,res, next) {
    console.log('login has been called');
    next();
}
