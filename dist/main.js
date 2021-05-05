"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("websocket");
var client = new websocket_1.client();
var cryptoName = "doge";
var zoneLangth = 20;
var centerLine = 20;
var zoneSpace = 0.03;
var zone = [];
var wallet = 1000000;
var capitalMoney = 1000000;
var buyAmount = 1000;
function main() {
    client.on("connectFailed", function (error) {
        console.log("Connect Error: " + error.toString());
    });
    client.on("connect", function (connection) {
        console.log("WebSocket Client Connected");
        zone = genZone();
        connection.on("error", function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on("close", function () {
            console.log("echo-protocol Connection Closed");
        });
        connection.on("message", function (message) {
            inState(message);
        });
    });
    client.connect("wss://api.bitkub.com/websocket-api/market.trade.thb_" + cryptoName);
}
function inState(message) {
    console.clear();
    var json = JSON.parse(message.utf8Data.split("\n")[0]);
    var rat = json.rat;
    zone = zone.map(function (zoneObject) {
        var zone = zoneObject;
        if (rat >= zoneObject.zoneValue + zoneSpace) {
            if (zoneObject.coin > 0 && zone.isBuy == true) {
                zone.status = "Sell";
                zone.isBuy = false;
                sell(zoneObject.coin, rat);
            }
        }
        else if (rat >= zoneObject.zoneValue &&
            rat < zoneObject.zoneValue + zoneSpace) {
            if (zone.isBuy !== true) {
                zone.status = "Buy";
                zone.isBuy = true;
                zone.coin = buy(buyAmount, rat);
            }
        }
        return __assign({}, zone);
    });
    console.log("Received: " + rat + " THB / " + cryptoName.toUpperCase());
    console.log("Money: " + wallet + " THB");
    console.log("Cash Flow: " + (wallet - capitalMoney) + " THB");
    genGraph(rat);
}
function genGraph(currentPrice) {
    zone.map(function (zoneObject) {
        var formatedNumber = zoneObject.zoneValue
            .toString()
            .padStart(10, " ")
            .padEnd(15, " ");
        if (zoneObject.zoneValue === currentPrice) {
            console.log("\x1b[43m%s\x1b[0m", "" + formatedNumber, zoneObject.check(zoneObject));
        }
        else if (zoneObject.zoneValue >= currentPrice) {
            console.log("\x1b[41m%s\x1b[0m", "" + formatedNumber, zoneObject.check(zoneObject));
        }
        else {
            console.log("\x1b[44m%s\x1b[0m", "" + formatedNumber, zoneObject.check(zoneObject));
        }
    });
}
function genZone() {
    var upSpaceZone = [];
    var downSpaceZone = [];
    var test = centerLine;
    for (var index = 0; index < zoneLangth; index++) {
        var numberSpace = test + zoneSpace;
        upSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
        test = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
    }
    var test2 = centerLine;
    for (var index = 0; index < zoneLangth; index++) {
        var numberSpace = test2 - zoneSpace;
        downSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
        test2 = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
    }
    downSpaceZone.push(centerLine);
    var test3 = upSpaceZone
        .concat(downSpaceZone)
        .sort(function (a, b) { return a - b; })
        .reverse();
    var objectZone = test3.map(function (value) {
        return {
            zoneValue: value,
            isBuy: false,
            coin: 0,
            status: "",
            check: checkItSelf,
        };
    });
    return objectZone;
}
var checkItSelf = function (zoneObject) {
    return zoneObject.status;
};
function buy(money, rat) {
    var coin = money / rat;
    wallet = wallet - money;
    return coin;
}
function sell(coin, rat) {
    var money = coin * rat;
    wallet = wallet + money;
    return money;
}
main();
