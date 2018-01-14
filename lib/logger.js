const winston = require('winston');

const logger = new winston.Logger({
    level: 'info',
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
