const winston = require('winston');

const logger = new winston.Logger({
    level: 'info',
    //format: winston.format.logstash(),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
