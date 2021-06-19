"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("websocket");
var HOST_WSS = "wss://api.bitkub.com";
var SocketIOManager = /** @class */ (function () {
    function SocketIOManager(cryptoName) {
        var newCrytoName = cryptoName === null || cryptoName === void 0 ? void 0 : cryptoName.split("_")[1].toLowerCase();
        this.socket = new websocket_1.client();
        this.socket.connect(HOST_WSS + "/websocket-api/market.trade.thb_" + newCrytoName);
    }
    SocketIOManager.getInstance = function (cryptoName) {
        if (!SocketIOManager.instance) {
            SocketIOManager.instance = new SocketIOManager(cryptoName);
        }
        return SocketIOManager.instance;
    };
    /**
     * on
     */
    SocketIOManager.prototype.on = function (event, callback) {
        return this.socket.on("connect", function (connection) {
            connection.on(event, function (e) {
                callback(e);
            });
        });
    };
    return SocketIOManager;
}());
exports.default = SocketIOManager;
