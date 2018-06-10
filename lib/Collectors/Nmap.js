'use strict';

const logger = require('../logger');
const nmap = require('node-nmap');

class Nmap {

    constructor(config) {
        this.config = config;
    }

    update(callback) {
        const quickScan = new nmap.QuickScan(this.config.network, '-n');

        quickScan.on('complete', results => {
            const hosts = results
                .filter(entry => entry.mac)
                .map(entry => {

                    logger.info({
                        module: 'collector.nmap',
                        event: 'host',
                        mac: entry.mac.toLowerCase(),
                        ip: entry.ip
                    });

                    return {
                        mac: entry.mac.toLowerCase(),
                        ip: entry.ip
                    };
                });

            logger.info({
                module: 'collector.nmap',
                event: 'finished',
                numHosts: hosts.length
            });

            return callback(null, hosts);
        });

        quickScan.on('error', error => {
            return callback(error);
        });

        quickScan.startScan();

        logger.info({
            module: 'collector.nmap',
            event: 'started'
        });
    }
}

module.exports = Nmap;