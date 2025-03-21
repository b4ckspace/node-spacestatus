'use strict';

const ip = require('ip');
const logger = require('../logger');
const unifi = require('node-unifi');

class Unifi {

    constructor(config) {
        this.config = config;
        this.unifi = new unifi.Controller(config.hostname, config.port);
    }

    update(callback) {

        logger.info({
            module: 'collector.unifi',
            event: 'started',
        });

        let graceful = (error, hosts) => {
            clearTimeout(timeout);
            this.unifi.logout();

            if (error) {
                logger.error({
                    module: 'collector.unifi',
                    event: 'finished',
                    error: error.message
                });

                return callback(error);
            }

            logger.info({
                module: 'collector.unifi',
                event: 'finished',
                numHosts: hosts.length
            });

            return callback(null, hosts);
        };

        const timeout = setTimeout(() => {
            // Prevent double execution of callback
            graceful = () => {};

            logger.error({
                module: 'collector.unifi',
                event: 'timeout',
            });

            return callback(null, []);
        }, this.config.timeoutMs);

        this.unifi.login(this.config.username, this.config.password, error => {

            if (error) {
                return graceful(error);
            }

            this.unifi.getClientDevices(this.config.site, (error, users) => {

                if (error) {
                    return graceful(error);
                }

                const hosts = (users[0] || [])
                   .filter(user => "mac" in user)
                   .filter(user => "ip" in user)
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

                return graceful(null, hosts);
            });
        })
    }
}


module.exports = Unifi;
