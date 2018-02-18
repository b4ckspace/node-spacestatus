'use strict';

const ip = require('ip');
const fs = require('fs');
const logger = require('../logger');
const exec = require('child_process').exec;

const ARP_REGEX = /^((?:\d{1,3}\.){3}\d{1,3})\s+[\dx]+\s+[\dx]+\s+((?:[0-9a-f]{2}\:){5}[0-9a-f]{2}).*$/gm;
const APR_CACHE_PATH = '/proc/net/arp';

class Fping {

    constructor(config) {
        this.config = config;
    }

    update(callback) {

        exec(this.config.path + ' -r0 -aqg ' + this.config.network, (error)  => {

            if (error.code > 2) {
                return callback(error);
            }

            fs.readFile(APR_CACHE_PATH, (error, data) => {

                if (error) {
                    return callback(error);
                }

                let result = [];

                data
                    .toString()
                    .replace(ARP_REGEX, (_, address, mac) => {

                        if (mac === '00:00:00:00:00:00' || !ip.cidrSubnet(this.config.network).contains(address)) {
                            return;
                        }

                        logger.info({
                            module: 'collector.fping',
                            event: 'host',
                            mac: mac.toLowerCase(),
                            ip: address
                        });

                        result.push({mac: mac.toLowerCase(), ip: address});
                    });

                return callback(null, result);
            });
        });

        logger.info({
            module: 'collector.fping',
            event: 'started'
        });
    }
}

module.exports = Fping;