module.exports = function (req, res, next) {

    console.log('Example middleware has been passed');
    next();

}
