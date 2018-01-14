'use strict';
const async = require('async');
const mqtt = require('mqtt');
const ms = require('ms');

const argv = require('yargs')
    .usage('Usage: $0 --config config')
    .argv;

const ip = require('ip');
const logger = require('./lib/logger');
const Unifi = require('./lib/Collectors/Unifi');
const Nmap = require('./lib/Collectors/Nmap');
const CollectorRunner = require('./lib/CollectorRunner');
const MySQL = require('./lib/Database/MySQL');
const AliveHosts = require('./lib/Database/AliveHosts');
const configurations = require('./lib/configurations');

const config = configurations.getConfig(argv.config);

const mqttClient = mqtt.connect('mqtt://' + config.mqtt.hostname);
const mysql = new MySQL(config.mysql);
const aliveHosts = new AliveHosts(mysql);

const collector = new CollectorRunner();

collector.add(new Unifi(config.unifi));
collector.add(new Nmap(config.nmap));

let lastDeviceCount = 0;
let lastMemberCount = 0;
let lastMemberNames = '';

function update() {

    async
        .waterfall([

            (callback) => collector.update(callback),

            (hosts, callback) => {

                if (config.ip) {
                    hosts = hosts.filter(host => (ip.toLong(host.ip) >= config.ip.from && ip.toLong(host.ip) <= config.ip.to));
                }

                if (lastDeviceCount != hosts.length) {
                    mqttClient.publish(config.mqtt.topics.deviceCount, '' + hosts.length, config.mqtt.options);
                }

                aliveHosts.insertHosts(hosts, (error, result) => callback(error));
                lastDeviceCount = hosts.length;
            },

            (callback) => aliveHosts.getMembersSince(config.lookbackIntervalMs, callback),

            (members, callback) => {

                const memberNames = members.map(member => {
                    if (member.privacy == 2) {
                        return 'anonymous';
                    }

                    return member.nickname;
                }).join(', ');

                if (lastMemberNames != memberNames) {
                    mqttClient.publish(config.mqtt.topics.memberNames, memberNames, config.mqtt.options);
                }

                if (lastMemberCount != members.length) {
                    mqttClient.publish(config.mqtt.topics.memberPresent, '' + members.length, config.mqtt.options);

                    if (members.length > 0 && lastMemberCount == 0) {
                        mqttClient.publish(config.mqtt.topics.spaceStatus, 'open', config.mqtt.options);
                    } else if (members.length == 0 && lastMemberCount > 0) {
                        mqttClient.publish(config.mqtt.topics.spaceStatus, 'closed', config.mqtt.options);
                    }
                }

                lastMemberCount = 0;
                lastMemberNames = memberNames;

                return callback(null);
            },

            (callback) => {
                aliveHosts.cleanup(config.cleanupIntervalMs, callback);
                return callback(null);
            }
        ], (error) => {

            if (error) {
                logger.error({
                    module: 'main',
                    event: 'finished',
                    error: error
                });
            } else {
                logger.info({
                    module: 'main',
                    event: 'finished'
                });
            }

            setTimeout(update, config.intervalMs);
        });
}

mysql.connect(() => {
    update();
});

