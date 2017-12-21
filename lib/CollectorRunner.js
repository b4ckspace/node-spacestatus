'use strict';

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
                return (callback) => {
                    collector.update(callback);
                };
            });

        async.parallel(runner, (error, results) => {

            if (error) {
                return callback(error);
            }

            // Dedupe by mac address
            let result = [];
            [].concat.apply([], results).forEach((entry) => {
                result[entry.mac] = entry;
            });

            callback(null, Object.values(result));
        });
    }
}

module.exports = CollectorRunner;