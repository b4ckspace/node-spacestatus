# node-spacestatus

node.js script used to determine present members using different "collectors" 

## collectors

### unifi

Connects to the unifi controller and collects all connected users. The result can be filtered by a subnet

### nmap

Scans the given network with a simple "QuickScan" (-sP -n) without resolving the hostname (faster).
To return the mac addresses this script needs to be run by root

## installation

It's just as simple as that:

```bash
npm install
node index.js --config <path to config>
```