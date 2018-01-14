'use strict';

const logger = require('./logger');
const async = require('async');

class CollectorRunner {

    constructor() {
        this.collectors = [];
    }

    add(collector) {
        this.collectors.push(collector);
    }

    update(callback) {

        const runner = this.collectors.map(collector => {
                return callback => collector.update(callback);
            });

        logger.info({
            module: 'collector',
            event: 'started'
        });

        async.parallel(runner, (error, results) => {

            if (error) {
                return callback(error);
            }

            // Dedupe by mac address
            let hosts = [];
            [].concat.apply([], results).forEach(entry => {
                hosts[entry.mac] = entry;
            });

            logger.info({
                module: 'collector',
                event: 'finished',
                hosts: Object.values(hosts).length
            });

            callback(null, Object.values(hosts));
        });
    }
}

module.exports = CollectorRunner;