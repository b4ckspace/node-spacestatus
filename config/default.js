const ms = require('ms');

module.exports = {

    intervalMs: ms('5m'),

    mqtt: {
        hostname: 'mqtt.core.bckspc.de',
        topics: {
            spaceStatus: 'sensor/space/status',
            memberCount: 'sensor/space/member/count'
        }
    },

    mysql: {
        hostname: 'violet.core.bckspc.de',
        username: '',
        password: '',
        database: ''
    },

    unifi: {
        hostname: '',
        port: 9443,
        username: '',
        password: '',
        site: 'default',
        network: '10.1.20.0/24'
    },

    nmap: {
        network: '10.1.20.0/24'
    }
};