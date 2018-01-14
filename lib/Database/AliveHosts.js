'use strict';

const moment = require('moment');
const ip = require('ip');

const PRIVACY_NONE = 0;
const PRIVACY_USER = 1;
const PRIVACY_ANONYMOUS = 2;
const PRIVACY_HIDDEN = 3;
const PRIVACY_DONTLOG = 4;

class AliveHosts {

    constructor(database) {
        this.database = database;
    }

    insertHosts(hosts, callback) {

        if (hosts.length === 0) {
            return callback(null, []);
        }

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
            INNER JOIN mac_to_nick as t2 ON t1.macaddr = t2.macaddr AND t2.privacy IN(${PRIVACY_NONE}, ${PRIVACY_USER}, ${PRIVACY_ANONYMOUS})
            WHERE t1.erfda > NOW() - INTERVAL ${minutes} MINUTE
            GROUP by nickname`, [], (error, result) => {

                if (error) {
                    return callback(error);
                }

                const member = result.map(result => {
                    return {
                        nickname: result.nickname,
                        privacy: result.privacy
                    };
                });

                return callback(null, member);
            });
    }

    cleanup(intervalMs, callback) {
        const minutes = Math.floor(intervalMs / 1000 / 60);
        this.database.query(`DELETE FROM alive_hosts WHERE erfda < NOW() - INTERVAL ${minutes} MINUTE`, callback);
    }
}


module.exports = AliveHosts;