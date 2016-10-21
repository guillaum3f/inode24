/*
 * description : List all .js files in folder "routes" and render the list to the client.
 * Author : GP
 * Licence : none
*/

const fs = require('fs');
const path = require('path');
module.exports = function(req, res, next) {
	
    const folder = __dirname+'/../routes/';
    const protocol = 'HTTP/1.1';

    const route = function(file) {
        var raw = file.slice(0,-3); 
        var method = raw.split('-')[raw.split('-').length-1]; 
        var route = file.slice(0,-3).slice(0,(-method.length-1)); 
        return protocol.toUpperCase()+' '+method.toUpperCase()+' '+route;
    }

    fs.readdir(folder, (err, files) => {
        files.forEach((file, idx, arr) => {
            if(path.extname(file) === '.js') {
                if (idx === arr.length - 1){ 
                    res.write(route(file));
                } else {
                    res.write(route(file)+'\n');
                }
            }
        });
	    next();
    })
	
};
