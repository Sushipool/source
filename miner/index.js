// https://stackoverflow.com/questions/17554688/has-anyone-tried-using-the-uv-threadpool-size-environment-variable
const os = require('os');
const maxThreads = os.cpus().length;
process.env.UV_THREADPOOL_SIZE = maxThreads;

const Nimiq = require('@nimiq/core');
const argv = require('minimist')(process.argv.slice(2));
const readFromFile = require('./src/Config.js');
const SushiPoolMiner = require('./src/SushiPoolMiner.js');
let Finder = require('./src/ServerFinder.js');
const ServerFinder = new Finder();
const readlineSync = require('readline-sync');
var fs = require('fs');
const pjson = require('./package.json');

const START = Date.now();
const TAG = 'SushiPool';
const $ = {};
const defaultConfigFile = 'sushipool.conf';

const servers = [
    'eu.sushipool.com',
    'us.sushipool.com',
    'asia.sushipool.com',
    'aus.sushipool.com'
];
const poolPort = 443;

Nimiq.Log.instance.level = 'info';


if (argv.hasOwnProperty('address')) {
    Nimiq.Log.i(TAG, 'Reading config from argv');
    const askAddress = argv['address'];
    const askNumThreads = argv.hasOwnProperty('threads') ? argv['threads'] : maxThreads;
    const askName = argv.hasOwnProperty('name') ? argv['name'] : '';
    const ask = {
        address: askAddress,
        threads: askNumThreads,
        name: askName
    };
    const data = JSON.stringify(ask, null, 4);
    fs.writeFileSync(defaultConfigFile, data);
    config = readFromFile(defaultConfigFile);
} else {
    Nimiq.Log.i(TAG, `Trying ${defaultConfigFile}`);
    config = readFromFile(defaultConfigFile);
    if (!config) {
        Nimiq.Log.i(TAG, 'No configuration file found. Please answer the following questions:');
        const askAddress = readlineSync.question('Enter Nimiq Wallet Address (e.g. NQXX .... ....): ', {
            limit: function (input) {
                try {
                    Nimiq.Address.fromUserFriendlyAddress(input);
                } catch (err) {
                    return false
                }
                return true;
            },
            limitMessage: '$<lastInput> is not a valid Nimiq Wallet Address'
        });
        const askName = argv.hasOwnProperty('name') ? argv['name'] : readlineSync.question(`Enter a name for this miner (press Enter to use ${os.hostname}): `);
        const query = `Enter the number of threads to use for mining (max ${maxThreads}): `;
        const askNumThreads = argv.hasOwnProperty('threads') ? argv['threads'] : readlineSync.questionInt(query);
        const ask = {
            address: askAddress,
            threads: askNumThreads,
            name: askName
        };
        const data = JSON.stringify(ask, null, 4);
        fs.writeFileSync(defaultConfigFile, data);
        config = readFromFile(defaultConfigFile);
    }
}



config = Object.assign(config, argv);
config.poolMining.enabled = true;
config.poolMining.port = poolPort;
config.miner.enabled = true;

if(config.hasOwnProperty('debug')){
    Nimiq.Log.instance.level = 'debug';
}

if (argv.hasOwnProperty('test')){
    Nimiq.Log.w('----- YOU ARE CONNECTING TO TESTNET -----');
    config.network = 'test';
} else {
    config.network = 'main';
}

if(config.hasOwnProperty('threads')){
    config.miner.threads = config.threads;
    delete config.threads;
}
if (typeof config.miner.threads !== 'number' && config.miner.threads !== 'auto') {
    Nimiq.Log.e(TAG, 'Specify a valid thread number');
    process.exit(1);
}
const customSeedServers = config.seeds || argv.seeds;
function humanHashes(bytes) {
    let thresh = 1000;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' H/s';
    }
    let units = ['kH/s','MH/s','GH/s','TH/s','PH/s','EH/s','ZH/s','YH/s'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}
(async () => {
    //fs.writeFileSync(defaultConfigFile, data);
    let currentServerIndex = 0;

    Nimiq.Log.i(TAG, `Finding closest server.`);
    const serversSorted = await ServerFinder.findClosestServers(servers, config.poolMining.port);
    const closestServer = serversSorted[0];
    if(!config.server || config.server === 'auto') {
        config.server = closestServer.host;
        Nimiq.Log.i(TAG, `Closest server: ${config.server}`);
    }
    config.poolMining.host = config.server;

    const deviceName = config.name || os.hostname();
    Nimiq.Log.i(TAG, `Sushipool Miner ${pjson.version} starting`);
    Nimiq.Log.i(TAG, `- network          = ${config.network}`);
    Nimiq.Log.i(TAG, `- no. of threads   = ${config.miner.threads}`);
    Nimiq.Log.i(TAG, `- pool server      = ${config.poolMining.host}:${config.poolMining.port}`);
    Nimiq.Log.i(TAG, `- address          = ${config.address}`);
    Nimiq.Log.i(TAG, `- device name      = ${deviceName}`);
    if( Nimiq.Log.instance.level === 3){
        Nimiq.Log.w(TAG, `Debug mode has been enabled.`);
    }
    Nimiq.Log.i(TAG, `Please wait while we establish consensus.`);

    Nimiq.GenesisConfig.init(Nimiq.GenesisConfig.CONFIGS[config.network]);
    Nimiq.GenesisConfig.SEED_PEERS.push(Nimiq.WssPeerAddress.seed('seed1.sushipool.com', 443));
    if(customSeedServers){
        Nimiq.Log.i(TAG, `Setting custom seed servers`);
        while(Nimiq.GenesisConfig.SEED_PEERS.length !== 0){
            Nimiq.GenesisConfig.SEED_PEERS.pop();
        }
        let list = customSeedServers.split(',');
        for(let s of list){
            let seedData = s.split(':');
            Nimiq.GenesisConfig.SEED_PEERS.push(Nimiq.WssPeerAddress.seed(seedData[0], parseInt(seedData[1])));
        }
    }
    const networkConfig = new Nimiq.DumbNetworkConfig();
    $.consensus = await Nimiq.Consensus.light(networkConfig);
    $.blockchain = $.consensus.blockchain;
    $.accounts = $.blockchain.accounts;
    $.mempool = $.consensus.mempool;
    $.network = $.consensus.network;

    $.walletStore = await new Nimiq.WalletStore();
    if (!config.address) {
        // Load or create default wallet.
        $.wallet = await $.walletStore.getDefault();
    } else {
        const address = Nimiq.Address.fromUserFriendlyAddress(config.address);
        $.wallet = {address: address};
        // Check if we have a full wallet in store.
        const wallet = await $.walletStore.get(address);
        if (wallet) {
            $.wallet = wallet;
            await $.walletStore.setDefault(wallet.address);
        }
    }

    const account = await $.accounts.get($.wallet.address);
    Nimiq.Log.i(TAG, `Wallet initialized for address ${$.wallet.address.toUserFriendlyAddress()}.`
        + ` Balance: ${Nimiq.Policy.satoshisToCoins(account.balance)} NIM`);
    Nimiq.Log.i(TAG, `Blockchain state: height=${$.blockchain.height}, headHash=${$.blockchain.headHash}`);

    // connect to pool
    const deviceId = Nimiq.BasePoolMiner.generateDeviceId(networkConfig);
    const startDifficulty = config.startDifficulty || 1;
    $.miner = new SushiPoolMiner('smart', $.blockchain, $.accounts, $.mempool, $.network.time, $.wallet.address, deviceId, deviceName, startDifficulty);

    $.consensus.on('established', () => {
        Nimiq.Log.i(TAG, `Connecting to pool ${config.poolMining.host} using device id ${deviceId} as a smart client.`);
        $.miner.connect(config.poolMining.host, config.poolMining.port);
    });

    $.miner.on('pool-disconnected', function () {
        let nextServerIndex = currentServerIndex+1;
        if(!serversSorted[nextServerIndex]){
            nextServerIndex = 0;
        }
        let nextServer = serversSorted[nextServerIndex];
        if(nextServer) {
            Nimiq.Log.w(TAG, `Lost connection with ${config.poolMining.host}, switching to ${nextServer.host}`);
            config.poolMining.host = nextServer.host;
            $.miner.changeServer(config.poolMining.host, config.poolMining.port);
            currentServerIndex = nextServerIndex;
        }
    });

    $.blockchain.on('head-changed', (head) => {
        if ($.consensus.established || head.height % 100 === 0) {
            Nimiq.Log.i(TAG, `Now at block: ${head.height}`);
        }
    });

    $.network.on('peer-joined', (peer) => {
        Nimiq.Log.i(TAG, `Connected to ${peer.peerAddress.toString()}`);
    });

    $.network.on('peer-left', (peer) => {
        Nimiq.Log.i(TAG, `Disconnected from ${peer.peerAddress.toString()}`);
    });

    $.network.connect();
    $.consensus.on('established', () => $.miner.startWork());
    $.consensus.on('lost', () => $.miner.stopWork());
    if (typeof config.miner.threads === 'number') {
        $.miner.threads = config.miner.threads;
    }

    $.consensus.on('established', () => {
        Nimiq.Log.i(TAG, `Blockchain consensus established in ${(Date.now() - START) / 1000}s.`);
        Nimiq.Log.i(TAG, `Current state: height=${$.blockchain.height}, totalWork=${$.blockchain.totalWork}, headHash=${$.blockchain.headHash}`);
    });

    $.miner.on('block-mined', (block) => {
        Nimiq.Log.i(TAG, `Block mined: #${block.header.height}, hash=${block.header.hash()}`);
    });


    // Output regular statistics
    const hashrates = [];
    const outputInterval = 5;
    $.miner.on('hashrate-changed', async (hashrate) => {
        hashrates.push(hashrate);

        if (hashrates.length >= outputInterval) {
            const account = await $.accounts.get($.wallet.address);
            const sum = hashrates.reduce((acc, val) => acc + val, 0);
            Nimiq.Log.i(TAG, `Hashrate: ${humanHashes((sum / hashrates.length).toFixed(2).padStart(7))}`
                + ` - Balance: ${Nimiq.Policy.satoshisToCoins(account.balance)} NIM`
                + ` - Mempool: ${$.mempool.getTransactions().length} tx`);
            hashrates.length = 0;
        }
    });

})().catch(e => {
    console.error(e);
    process.exit(1);
});
