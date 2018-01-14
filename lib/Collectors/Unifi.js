'use strict';

const ip = require('ip');
const unifi = require('node-unifi');

class Unifi {

    constructor(config) {
        this.config = config;
        this.unifi = new unifi.Controller(config.hostname, config.port);
    }

    update(callback) {

        let graceful = (error, hosts) => {
            clearTimeout(timeout);
            this.unifi.logout();

            return callback(error, hosts);
        };

        const timeout = setTimeout(() => {
            // Prevent double execution of callback
            graceful = () => {};

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

                const hosts = users[0]
                    .filter(user => ip.cidrSubnet(this.config.network).contains(user.ip))
                    .map(user => {
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