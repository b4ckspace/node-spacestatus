'use strict';

const nmap = require('node-nmap');

class Nmap {

    constructor(config) {
        this.config = config;
    }

    update(callback) {
        const quickScan = new nmap.QuickScan(this.config.network, '-n');

        quickScan.on('complete', (results) => {
            const result = results
                .filter(entry => entry.mac)
                .map(entry => {
                    return {
                        mac: entry.mac.toLowerCase(),
                        ip: entry.ip
                    };
                });

            return callback(null, result);
        });

        quickScan.on('error', (error) => {
            return callback(error);
        });

        quickScan.startScan();
    }
}

module.exports = Nmap;