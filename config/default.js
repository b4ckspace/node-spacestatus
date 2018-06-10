const ip = require('ip');
const ms = require('ms');

module.exports = {

    intervalMs: ms('5m'),
    lookbackIntervalMs: ms('15m'),
    cleanupIntervalMs: ms('14d'),

    // Filter ip after collecting
    ip: {
        from: ip.toLong('10.1.20.100'),
        to: ip.toLong('10.1.20.255'),
    },

    mqtt: {
        hostname: 'mqtt.core.bckspc.de',

        options: {
            qos: 1,
            retain: true
        },

        topics: {
            spaceStatus: 'sensor/space/status',
            memberPresent: 'sensor/space/member/present',
            memberNames: 'sensor/space/member/names',
            deviceCount: 'sensor/space/member/deviceCount'
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
        network: '10.1.20.0/24',
        timeoutMs: ms('20s')
    },

    nmap: {
        network: '10.1.20.100-255'
    }
};