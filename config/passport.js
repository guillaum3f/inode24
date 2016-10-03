var LDAPStrategy = require('passport-ldapauth');
module.exports = function(passport) {
    passport.use(new LDAPStrategy({
        url: 'ldap://127.0.0.1:1389',
        base: 'o=example',
        search: {
            filter: '(&(l=Seattle)(email=*@foo.com))',
        }
    },
    function(profile, done) {
        return done(null, profile);
    }
    ));
}
