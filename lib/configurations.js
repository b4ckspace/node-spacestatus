const configurations = require('configurations');
const path = require('path');

module.exports.getConfig = (externalconfig) => {
    return configurations.load(path.join(__dirname, '../config'), {
        externalconfig: externalconfig
    });
};