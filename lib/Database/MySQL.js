'use strict';

const mysql = require('mysql');

class MySQLConnection {

    constructor(config) {
        this.connectionPool = null;
        this.config = config;
    }

    connect(callback) {
        this.connectionPool = new mysql.createPool({
            host: this.config.hostname,
            user: this.config.username,
            port: this.config.port || 3306,
            password: this.config.password,
            database: this.config.database
        });

        callback();
    }

    query(query, args, callback) {
        this.connectionPool.query({ sql: query, values: args }, callback);
    }

}

module.exports = MySQLConnection;