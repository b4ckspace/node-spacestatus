'use strict';

const moment = require('moment');
const ip = require('ip');

class AliveHosts {

    constructor(database) {
        this.database = database;
    }

    insertHosts(hosts, callback) {
        const time = moment().format('YYYY-MM-DD HH:mm:ss');
        const values = hosts.map(host => [host.mac, ip.toLong(host.ip), time]);

        this.database.query('INSERT INTO alive_hosts (macaddr, iplong, erfda) VALUES ?', [values], (error, result) => {
            return callback(error, result);
        });
    }

    getMembersSince(intervalMs, callback) {
        const minutes = Math.floor(intervalMs / 1000 / 60);

        this.database.query(`
            SELECT t2.nickname as nickname, t2.privacy as privacy
            FROM alive_hosts as t1
            INNER JOIN mac_to_nick as t2 ON t1.macaddr = t2.macaddr AND t2.privacy IN(0, 1, 2)
            WHERE t1.erfda > NOW() - INTERVAL ${minutes} MINUTE
            GROUP by nickname`, [], (error, result) => {
                if (error) {
                    return callback(error);
                }

                const member = result.map((result) => {
                    return {
                        nickname: result.nickname,
                        privacy: result.privacy
                    }
                });

                return callback(null, member);
            });
    }
}


module.exports = AliveHosts;