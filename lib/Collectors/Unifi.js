'use strict';

const ip = require('ip');
const logger = require('../logger');
const UnifiController = require('ubnt-unifi');

class Unifi {

    constructor(config) {
        this.config = config;

        this.unifi = new UnifiController({
            host: config.hostname,
            port: config.port,
            username: config.username,
            password: config.password,
            site: config.site,
            insecure: true
        });
    }

    update(callback) {

        logger.info({
            module: 'collector.unifi',
            event: 'started',
        });

        this.unifi
            .get('stat/sta')
            .then(users => {

                const hosts = users
                    .data
                    .filter(user => ip.cidrSubnet(this.config.network).contains(user.ip))
                    .map(user => {

                        logger.info({
                            module: 'collector.unifi',
                            event: 'host',
                            mac: user.mac.toLowerCase(),
                            ip: user.ip
                        });

                        return {
                            mac: user.mac.toLowerCase(),
                            ip: user.ip
                        };
                    });

                return callback(null, hosts);
            },

            error => {
                return callback(error);
            });
    }
}

module.exports = Unifi;