'use strict';

const ip = require('ip');
const unifi = require('node-unifi');

class Unifi {

    constructor(config) {
        this.config = config;
        this.unifi = new unifi.Controller(config.hostname, config.port);
    }

    update(callback) {

        const timeout = setTimeout(() => {
            const tmp = callback;

            // Prevent double execution of callback
            callback = () => {};

            return tmp(null, []);
        }, this.config.timeoutMs);

        this.unifi.login(this.config.username, this.config.password, error => {

            if (error) {
                clearTimeout(timeout);
                return callback(error);
            }

            this.unifi.getClientDevices(this.config.site, (error, users) => {

                if (error) {
                    clearTimeout(timeout);
                    return callback(error);
                }

                const result = users[0]
                    .filter(user => ip.cidrSubnet(this.config.network).contains(user.ip))
                    .map(user => {
                        return {
                            mac: user.mac.toLowerCase(),
                            ip: user.ip
                        };
                    });

                clearTimeout(timeout);
                this.unifi.logout();

                return callback(null, result);
            });
        })
    }
}


module.exports = Unifi;