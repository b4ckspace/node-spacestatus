const ms = require('ms');
const Unifi = require('./lib/Collectors/Unifi');
const Nmap = require('./lib/Collectors/Nmap');
const CollectorRunner = require('./lib/CollectorRunner');
const MySQL = require('./lib/Database/MySQL');
const AliveHosts = require('./lib/Database/AliveHosts');

const config = require('./config/default');

const mysql = new MySQL(config.mysql);
const aliveHosts = new AliveHosts(mysql);
const collector = new CollectorRunner();

collector.add(new Unifi(config.unifi));
collector.add(new Nmap(config.nmap));


mysql.connect(() => {
    collector.update((error, results) => {
        aliveHosts.insertHosts(results, () => {
            console.log("Oki");
        });
    });

    aliveHosts.getMembersSince(ms('15m'), (error, member) => {
        console.log(error, member);
    });
});

