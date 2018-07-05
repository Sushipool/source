"use strict";

const os = require("os");
const maxThreads = os.cpus().length;
process.env.UV_THREADPOOL_SIZE = maxThreads;

const electron = require("electron");
const path = require("path");
const reload = require("electron-reload");
const isDev = require("electron-is-dev");
const Store = require('electron-store');
const Nimiq = require("@nimiq/core");
const SushiPoolMiner = require("./SushiPoolMiner.js");

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// to store configs
const store = new Store();

// causes weird page reloads when mining?
// if (isDev) {
// 	const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
// 	reload(__dirname, { electron: electronPath });
// }

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
    mainWindow.webContents.on("did-finish-load", () => {
        // try to load previously saved values
        const walletAddress = store.get('walletAddress');
        const poolMiningHost = store.get('poolMiningHost');
        const numThreads = store.get('numThreads') || maxThreads;
        const deviceName = store.get('deviceName') || os.hostname();
        // set initial form values
        const params = {
            walletAddress: walletAddress,
            poolMiningHost: poolMiningHost,
            numThreads: numThreads,
            deviceName: deviceName
        };
        mainWindow.webContents.send("initFormParams", params);
    });
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function humanHashes(bytes) {
    let thresh = 1000;
    if (Math.abs(bytes) < thresh) {
        return bytes + " H/s";
    }
    let units = [
        "kH/s",
        "MH/s",
        "GH/s",
        "TH/s",
        "PH/s",
        "EH/s",
        "ZH/s",
        "YH/s"
    ];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
}

Nimiq.Log.instance.level = "info";
const TAG = "SushiPool";
const POOR_MINING_PORT = 443;
const START_MINING_MSG = "Start mining!";
const STOP_MINING_MSG = "Stop mining";
const DASHBOARD_MINING = "Mining";
const DASHBOARD_IDLE = "Idle";
let peers = 0;

// global reference to miner
let miner = undefined;
let isMining = false;

ipcMain.on("mine", (event, args) => {
    const $ = {};

    function showMessage(msg) {
        Nimiq.Log.i(TAG, msg);
        event.sender.send("logging", msg);
    }

    function updateMineButton(disabled, label) {
        const args = {
            disabled: disabled,
            label: label
        };
        event.sender.send("mine-button", args);
    }
	
    const walletAddress = args.walletAddress;
    const poolMiningHost = args.poolMiningHost;
    const numThreads = args.noOfThreads;

    // store for the next run
    store.set('walletAddress', walletAddress);
    store.set('poolMiningHost', poolMiningHost);
    store.set('numThreads', numThreads);

    if (miner === undefined) {
        (async () => {
            // TODO: connect immediately once the app is loaded
            updateMineButton(true, "Miner initialising");
            event.sender.send("switchTab", "#logs-tab");
            Nimiq.GenesisConfig.init(Nimiq.GenesisConfig.CONFIGS["main"]);
            const networkConfig = new Nimiq.DumbNetworkConfig();
            $.consensus = await Nimiq.Consensus.light(networkConfig);
            $.blockchain = $.consensus.blockchain;
            $.accounts = $.blockchain.accounts;
            $.mempool = $.consensus.mempool;
            $.network = $.consensus.network;

            $.walletStore = await new Nimiq.WalletStore();
            if (!walletAddress) {
                // Load or create default wallet.
                $.wallet = await $.walletStore.getDefault();
            } else {
                const address = Nimiq.Address.fromUserFriendlyAddress(
                    walletAddress
                );
                $.wallet = { address: address };
                // Check if we have a full wallet in store.
                const wallet = await $.walletStore.get(address);
                if (wallet) {
                    $.wallet = wallet;
                    await $.walletStore.setDefault(wallet.address);
                }
            }
            showMessage(`Wallet address: ${$.wallet.address.toUserFriendlyAddress()})`);
            showMessage(`Pool server: ${args.poolMiningHost}`);
            showMessage(`No. of threads: ${args.noOfThreads}`);

            const account = await $.accounts.get($.wallet.address);
            const deviceId = Nimiq.BasePoolMiner.generateDeviceId(
                networkConfig
            );
            const deviceName = os.hostname();
            const startDifficulty = 1; // TODO: set this from form??
            $.miner = new SushiPoolMiner(
                'smart',
                $.blockchain,
                $.accounts,
                $.mempool,
                $.network.time,
                $.wallet.address,
                deviceId,
                deviceName,
                startDifficulty
            );
            miner = $.miner;

            $.consensus.on("established", () => {
                const msg = `Connecting to pool ${poolMiningHost} using device id ${deviceId} as a smart client.`;
                showMessage(msg);
                $.miner.connect(poolMiningHost, POOR_MINING_PORT);
            });

            $.blockchain.on("head-changed", head => {
                if ($.consensus.established || head.height % 100 === 0) {
                    const msg = `Now at block: ${head.height}`;
                    showMessage(msg);
					event.sender.send("dashboard", {block: head.height});																					
                }
            });

            $.network.on("peer-joined", peer => {
                const msg = `Connected to ${peer.peerAddress.toString()}`;
                showMessage(msg);
				peers += 1;
				event.sender.send("dashboard", {peers: peers});												
            });

            $.network.on("peer-left", peer => {
                const msg = `Disconnected from ${peer.peerAddress.toString()}`;
                showMessage(msg);
				peers -= 1;
				event.sender.send("dashboard", {peers: peers});																
            });

            $.network.connect();
            $.consensus.on("established", () => {
                $.miner.startWork();
                isMining = true;
                updateMineButton(false, STOP_MINING_MSG);
				event.sender.send("dashboard", {status: DASHBOARD_MINING});							
            });
            $.consensus.on("lost", () => {
                $.miner.stopWork();
                isMining = false;
                updateMineButton(false, START_MINING_MSG);
				event.sender.send("dashboard", {status: DASHBOARD_IDLE});							
            });
            $.miner.threads = numThreads;

            $.consensus.on("established", () => {
                let msg = `Blockchain consensus established in ${(Date.now() -
                    START) /
                    1000}s.`;
                showMessage(msg);
                msg = `Current state: height=${
                    $.blockchain.height
                }, totalWork=${$.blockchain.totalWork}, headHash=${
                    $.blockchain.headHash
                }`;
                showMessage(msg);
            });

            $.miner.on("block-mined", block => {
                const msg = `Block mined: #${
                    block.header.height
                }, hash=${block.header.hash()}`;
                showMessage(msg);
            });

            // Output regular statistics
            const hashrates = [];
            const outputInterval = 5;
            $.miner.on("hashrate-changed", async hashrate => {
                hashrates.push(hashrate);

                if (hashrates.length >= outputInterval) {
                    const account = await $.accounts.get($.wallet.address);
                    const sum = hashrates.reduce((acc, val) => acc + val, 0);
					const hr = humanHashes((sum / hashrates.length).toFixed(2).padStart(7));
                    const msg =
                        `Hashrate: ${hr}` +
                        ` - Balance: ${Nimiq.Policy.satoshisToCoins(
                            account.balance
                        )} NIM` +
                        ` - Mempool: ${$.mempool.getTransactions().length} tx`;
                    showMessage(msg);
					event.sender.send("dashboard", {hashrate: hr});												
                    hashrates.length = 0;
                }
            });
        })().catch(e => {
            console.error(e);
            process.exit(1);
        });
    } else {
        // toggle mining on and off
        if (isMining) {
            miner.stopWork();
            isMining = false;
            showMessage("Miner stopped");
            updateMineButton(false, START_MINING_MSG);
			event.sender.send("dashboard", {status: DASHBOARD_IDLE});							
        } else {
            miner.startWork();
            isMining = true;
            showMessage("Miner started");
            updateMineButton(false, STOP_MINING_MSG);
            event.sender.send("switchTab", "#logs-tab");
			event.sender.send("dashboard", {status: DASHBOARD_MINING});							
        }
    }
});

ipcMain.on("noOfThreadsChanged", (event, args) => {
    if (miner !== undefined && isMining) {
        miner.threads = parseInt(args);
        const msg = `No. of threads = ${args}`;
        Nimiq.Log.i(TAG, msg);
        event.sender.send("logging", msg);
    }
});

exports.onClick = () => console.log("Yay");
