CREATE TABLE `alive_hosts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `macaddr` varchar(17) DEFAULT NULL,
  `iplong` int(11) DEFAULT NULL,
  `erfda` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `macaddr` (`macaddr`),
  KEY `iplong` (`iplong`)
) ENGINE=MyISAM;

CREATE TABLE `mac_to_nick` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `macaddr` varchar(17) DEFAULT NULL,
  `nickname` varchar(32) DEFAULT NULL,
  `descr` varchar(64) DEFAULT NULL,
  `privacy` tinyint(1) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `macaddr` (`macaddr`),
  KEY `nickname` (`nickname`),
  KEY `privacy` (`privacy`)
) ENGINE=MyISAM;
