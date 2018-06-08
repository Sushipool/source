"use strict";

const os = require('os');
const maxThreads = os.cpus().length;
process.env.UV_THREADPOOL_SIZE = maxThreads;

const electron = require("electron");
const path = require("path");
const reload = require("electron-reload");
const isDev = require("electron-is-dev");
const Nimiq = require('@nimiq/core');
const SushiPoolMiner = require('./SushiPoolMiner.js');

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

if (isDev) {
	const electronPath = path.join(__dirname, "node_modules", ".bin", "electron");
	reload(__dirname, { electron: electronPath });
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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

ipcMain.on('click', () => {

	console.log('do something');
	const $ = {};
	Nimiq.Log.instance.level = 'info';
	const TAG = 'SushiPool';
	(async () => {

		Nimiq.GenesisConfig.init(Nimiq.GenesisConfig.CONFIGS['main']);
	    const networkConfig = new Nimiq.DumbNetworkConfig();
		$.consensus = await Nimiq.Consensus.light(networkConfig);
	    $.blockchain = $.consensus.blockchain;
	    $.accounts = $.blockchain.accounts;
	    $.mempool = $.consensus.mempool;
	    $.network = $.consensus.network;
		$.walletStore = await new Nimiq.WalletStore();
		$.wallet = await $.walletStore.getDefault();
		const account = await $.accounts.get($.wallet.address);
		// connect to pool
	    const deviceId = Nimiq.BasePoolMiner.generateDeviceId(networkConfig);
		const deviceName = os.hostname();
	    $.miner = new SushiPoolMiner($.blockchain, $.accounts, $.mempool, $.network.time, $.wallet.address, deviceId, deviceName);
		const poolMiningHost = 'eu.sushipool.com';
		const poolMiningPort = 443;

		$.consensus.on('established', () => {
	        Nimiq.Log.i(TAG, `Connecting to pool ${poolMiningHost} using device id ${deviceId} as a smart client.`);
	        $.miner.connect(poolMiningHost, poolMiningPort);
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
		$.miner.threads = maxThreads;

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
});

exports.onClick = () => console.log('Yay');