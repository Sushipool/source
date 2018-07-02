var ping = require('ping');
class ServerFinder{
    async findClosestServers(_servers, port){
        this.servers = [];
        for(let server of _servers){
            let result = await ping.promise.probe(server);
            this.servers.push({host: server, time: result.time });
        }
        let sorted = this.servers.sort(function (a, b) {
            return a.time > b.time;
        });

        return sorted;
    }
}

module.exports = ServerFinder;