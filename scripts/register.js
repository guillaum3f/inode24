var ldap = require('ldapjs');
var assert = require('assert');
var ssha = require('node-ssha256');

module.exports = function (req,config,callback) {
    
    var client = ldap.createClient({
        url: 'ldap://127.0.0.1:1389'
    });

    //Bind as root to operate
    client.bind('cn=root', 'root', function(err) {
          assert.ifError(err);
    });

    //Get user data
    var cn = req.body.email; //user identifier
    var sn = req.body.username; //username
    var email = req.body.email; //email address
    var role = req.body.role; //email address
    var userPassword = req.body.password; //user password

    //Verification on data TODO

    //Search for existing user
    var opts = {
        filter: '(email=*)',
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn']
    };

    function success() {
        //Prepare entry insertion
        var entry = {
            cn: cn,
            sn: sn,
            mail: email,
            description: role,
            userPassword: userPassword,
            objectclass: 'inetOrgPerson'
        };

        //console.log(require(__dirname+'/../subserv/data.json'));

        //Present data to LDAP
        client.add('cn='+cn+', ou='+config.global.roles[role]+', ou=members, dc='+config.global.domain+', dc='+config.global.TLD, entry, function(err) {
            if(err) console.log(err);
            (err) ? callback(false) : callback(true);
        });
    }

    function failure() {
        callback(false);
    }

    client.search('cn='+cn+', o=innov24', opts, function(err, res) {
        res.on('searchEntry', function(entry) {
            failure();
        });
        res.on('searchReference', function(referral) {
            failure();
        });
        res.on('error', function(err) {
            success();
        });
        res.on('end', function(result) {
            failure();
        });
    });


}
