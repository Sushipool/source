const Nimiq = require('@nimiq/core');
const BasePoolMiner = Nimiq.BasePoolMiner;
const BufferUtils = Nimiq.BufferUtils;
const MerklePath = Nimiq.MerklePath;
const GenesisConfig = Nimiq.GenesisConfig;

class SushiPoolMiner extends BasePoolMiner {
    /**
     * @param {BaseChain} blockchain
     * @param {Accounts} accounts
     * @param {Mempool} mempool
     * @param {Time} time
     * @param {Address} address
     * @param {number} deviceId
     * @param {string} deviceName
     * @param {int} startDifficulty
     */
    constructor(mode, blockchain, accounts, mempool, time, address, deviceId, deviceName, startDifficulty) {
        let extraData = new Uint8Array(0);
        super(mode, blockchain, accounts, mempool, time, address, deviceId, extraData);
        this._deviceName = deviceName;
        this.on('share', (block, fullValid) => this._onBlockMined(block, fullValid));
        this._startDifficulty = startDifficulty;
    }

    /**
     * @param {Block} block
     * @param {boolean} fullValid
     * @private
     */
    async _onBlockMined(block, fullValid) {
        const readyState = this._ws.readyState;
        if (readyState === 3) {
            Nimiq.Log.w(SushiPoolMiner, `Incorrect websocket state detected! Reconnecting`);
            this._exponentialBackoffReconnect = 0;
            this._timeoutReconnect();
            return;
        } else {
            Nimiq.Log.i(SushiPoolMiner, `Still connected to pool`);
        }
        this._send({
            message: 'share',
            blockHeader: BufferUtils.toBase64(block.header.serialize()),
            minerAddrProof: BufferUtils.toBase64((await MerklePath.compute(block.body.getMerkleLeafs(), block.minerAddr)).serialize()),
            extraDataProof: BufferUtils.toBase64((await MerklePath.compute(block.body.getMerkleLeafs(), block.body.extraData)).serialize()),
            block: fullValid ? BufferUtils.toBase64(block.serialize()) : undefined
        });
    }

    _register() {
        const deviceName = this._deviceName || '';
        Nimiq.Log.i(SushiPoolMiner, `Registering to pool (${this._host}) using device id ${this._deviceId} (${deviceName}) as a smart client.`);
        this._send({
            message: 'register',
            mode: this.mode || 'smart',
            address: this._ourAddress.toUserFriendlyAddress(),
            deviceId: this._deviceId,
            startDifficulty: this._startDifficulty,
            deviceName: deviceName,
            genesisHash: BufferUtils.toBase64(GenesisConfig.GENESIS_HASH.serialize())
        });
    }

    _onError(ws, e) {
        console.error(e)
        if (ws === this._ws) {
            this._changeConnectionState(BasePoolMiner.ConnectionState.CLOSED);
            this.fire('pool-disconnected');
        }
    }

    _onClose(ws, e) {
        if (ws === this._ws) {
            this._changeConnectionState(BasePoolMiner.ConnectionState.CLOSED);
            this.fire('pool-disconnected');
        }
    }

    changeServer(server, port) {
        Nimiq.Log.w(SushiPoolMiner, `Switching to ${server}:${port}`);
        this.disconnect();
        this.connect(server,port);
    }
}

module.exports = SushiPoolMiner;