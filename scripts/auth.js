module.exports = function (req, res, next) {

    console.log('auth has been called');
    next();
}
