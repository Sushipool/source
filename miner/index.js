const Nimiq = require('@nimiq/core');
const argv = require('minimist')(process.argv.slice(2));
const readFromFile = require('./src/Config.js');

const START = Date.now();
const TAG = 'SushiPool';
const $ = {};

Nimiq.Log.instance.level = 'info';

let config = readFromFile(argv.config);
if (!config) {
    Nimiq.Log.i(TAG, 'Trying to read configurations from sushipool.conf');
    config = readFromFile('sushipool.conf');
    if (!config) {
        Nimiq.Log.e(TAG, 'Specify a valid config file with --config=FILE');
        process.exit(1);
    }
}

let pool_host;
if (!argv.hasOwnProperty('test')){
    pool_host = 'eu.sushipool.com';
} else {
    Nimiq.Log.w('----- YOU ARE CONNECTING TO TESTNET -----');
    pool_host = 'eu-test.sushipool.com';
    config.network = 'test';
}

config = Object.assign(config, argv);
config.poolMining.enabled = true;
config.poolMining.host = pool_host;
config.poolMining.port = 443;
config.miner.enabled = true;
if(config.hasOwnProperty('threads')){
    config.miner.threads = config.threads;
    delete config.threads;
}
if (typeof config.miner.threads !== 'number' && config.miner.threads !== 'auto') {
    Nimiq.Log.e(TAG, 'Specify a valid thread number');
    process.exit(1);
}

// for setting extradata automatically
function guid() { // from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function humanHashes(bytes) {
    var thresh = 1000;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' H/s';
    }
    var units = ['kH/s','MH/s','GH/s','TH/s','PH/s','EH/s','ZH/s','YH/s'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}
(async () => {
    Nimiq.Log.i(TAG, `SushiPool Miner starting.`);
    Nimiq.Log.i(TAG, `- network          = ${config.network}`);
    Nimiq.Log.i(TAG, `- no. of threads   = ${config.miner.threads}`);
    Nimiq.Log.i(TAG, `- pool server      = ${config.poolMining.host}:${config.poolMining.port}`);
    Nimiq.Log.i(TAG, `- address      = ${config.address}`);
    Nimiq.Log.i(TAG, `Please wait while we establish consensus.`);

    Nimiq.GenesisConfig.init(Nimiq.GenesisConfig.CONFIGS[config.network]);
    const networkConfig = new Nimiq.DumbNetworkConfig()
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
    let extraData = Nimiq.BufferUtils.fromAscii(TAG + '-' + guid());
    const deviceId = Nimiq.BasePoolMiner.generateDeviceId(networkConfig);

    $.miner = new Nimiq.SmartPoolMiner($.blockchain, $.accounts, $.mempool, $.network.time, $.wallet.address, deviceId, extraData);

    $.consensus.on('established', () => {
        Nimiq.Log.i(TAG, `Connecting to pool ${config.poolMining.host} using device id ${deviceId} as a smart client.`);
        $.miner.connect(config.poolMining.host, config.poolMining.port);
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
        Nimiq.Log.i(TAG, `Blockchain light-consensus established in ${(Date.now() - START) / 1000}s.`);
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
