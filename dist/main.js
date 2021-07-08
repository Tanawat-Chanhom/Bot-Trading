"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socketManager_1 = __importDefault(require("./services/socketManager"));
var bitkubManage_1 = __importDefault(require("./services/bitkubManage"));
/*
 **
 ** Version 2: Variable 461.86
 **
 */
var cryptoName = "THB_USDT";
var circle = 0;
var circleInprogress = false;
var currentPrice = -1;
var timeInterval = 1000;
var historyOrder = [];
var floatDecimalNumberFixed = 2;
var cashFlow = 0;
var logs = [];
// Zone Setting
var zones = [];
var maxZone = 35.0;
var minZone = 30.0;
var amountZone = 5; //Zone
var buyPerZone = 20; //THB
var bitkubManage_2 = require("./services/bitkubManage");
var IO = socketManager_1.default.getInstance(cryptoName);
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var checkingPrice_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, socketConnection()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var res;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(maxZone !== 0 && minZone !== 0)) return [3 /*break*/, 1];
                                        zones = generateZone(maxZone, minZone, amountZone);
                                        return [3 /*break*/, 3];
                                    case 1: return [4 /*yield*/, bitkubManage_1.default.getInstance().getPrice(cryptoName)];
                                    case 2:
                                        res = _a.sent();
                                        zones = generateZone(res.high24hr, res.low24hr, amountZone);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })()
                            .then(function () {
                            log("Generate Zone Successfully", "system");
                        })
                            .catch(function (error) {
                            log(error, "error");
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, bitkubManage_1.default.getInstance().getPrice(cryptoName)];
                                    case 1: return [4 /*yield*/, (_a.sent()).last];
                                    case 2:
                                        currentPrice = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })()
                            .then(function () {
                            log("Get CurrentPrice Successfully", "system");
                        })
                            .catch(function (error) {
                            log(error, "error");
                        })];
                case 3:
                    _a.sent();
                    setInterval(function () {
                        console.clear();
                        console.log("Cash Flow: " + cashFlow + " THB | Current Price: " + currentPrice + " | Circle: " + circle);
                        displayLogs();
                        displayZone();
                    }, 1000);
                    checkingPrice_1 = 0;
                    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (currentPrice !== checkingPrice_1 && circleInprogress === false) {
                                marketCircle();
                                checkingPrice_1 = currentPrice;
                                circle++;
                            }
                            return [2 /*return*/];
                        });
                    }); }, timeInterval);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    log(error_1 + "", "error");
                    console.log("Catch: ", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function marketCircle() {
    return __awaiter(this, void 0, void 0, function () {
        var zoneLength, zoneCount, _loop_1, index;
        return __generator(this, function (_a) {
            zoneLength = zones.length;
            zoneCount = 0;
            circleInprogress = true;
            _loop_1 = function (index) {
                var zoneByIndex = zones[index];
                buy(zoneByIndex).then(function () {
                    sell(zoneByIndex).then(function () {
                        zoneCount = zoneCount + 1;
                        if (zoneLength === zoneCount) {
                            circleInprogress = false;
                        }
                    });
                });
            };
            // zones.map(async (zone: any) => {
            // buy(zone).then(() => {
            //   sell(zone).then(() => {
            //     zoneCount = zoneCount + 1;
            //     if (zoneLength === zoneCount) {
            //       circleInprogress = false;
            //     }
            //   });
            // });
            // });
            for (index = 0; index < zoneLength; index++) {
                _loop_1(index);
            }
            return [2 /*return*/];
        });
    });
}
function buy(zone) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bitkubManage_1.default.getInstance().wallets("THB")];
                case 1:
                    wallet = _a.sent();
                    if (!(wallet > 20)) return [3 /*break*/, 4];
                    return [4 /*yield*/, checkOrderHistory(zone).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(zone.inOrder === false && currentPrice >= zone.startAt)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, bitkubManage_1.default.getInstance()
                                                .createBuy(cryptoName, buyPerZone, zone.startAt, "limit")
                                                .then(function (_a) {
                                                var result = _a.result;
                                                // let newZoneData = zone;
                                                zone.inOrder = true;
                                                zone.order = result;
                                                zone.orderType = "BUY";
                                                zone.moneySpent = result.amt;
                                                zone.cryptoReceived = result.rec;
                                                // zones[zone.zoneNumber] = newZoneData;
                                                log("Zone " + zone.zoneNumber + " is Order Buy [" + result.amt + "\u0E3F]", "common");
                                            })
                                                .catch(function (error) {
                                                log(error, "error");
                                            })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    // log(`Out BUY!! - ${zone.zoneNumber}`, "common");
                    return [4 /*yield*/, updateOrderHistory()];
                case 3:
                    // log(`Out BUY!! - ${zone.zoneNumber}`, "common");
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sell(zone) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // log(`Enter SELL!! - ${zone.zoneNumber}`, "common");
                return [4 /*yield*/, checkOrderHistory(zone).then(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(zone.isBuy === true)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, bitkubManage_1.default.getInstance()
                                            .createSell(cryptoName, zone.cryptoReceived, zone.endAt, "limit")
                                            .then(function (_a) {
                                            var result = _a.result;
                                            var cryptoSpent = zone.cryptoReceived;
                                            // let newZoneData = zone;
                                            zone.inOrder = true;
                                            zone.isBuy = false;
                                            zone.cryptoReceived = 0;
                                            zone.orderType = "SELL";
                                            zone.order = result;
                                            zone.moneyReceived = result.rec;
                                            // zones[zone.zoneNumber] = newZoneData;
                                            log("Zone " + zone.zoneNumber + " is Order Sell [" + cryptoSpent + " " + cryptoName.split("_")[1] + "]", "common");
                                        })
                                            .catch(function (err) {
                                            log(err, "error");
                                        })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    // log(`Enter SELL!! - ${zone.zoneNumber}`, "common");
                    _a.sent();
                    return [4 /*yield*/, updateOrderHistory()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function checkOrderHistory(zone) {
    return __awaiter(this, void 0, void 0, function () {
        var newZoneData, newZoneData;
        return __generator(this, function (_a) {
            if (zone.inOrder === true) {
                if (historyOrder.find(function (x) { return x.id === zone.order.id; })) {
                    return [2 /*return*/];
                }
                if (zone.orderType === "BUY") {
                    newZoneData = zone;
                    newZoneData.inOrder = false;
                    newZoneData.isBuy = true;
                    zones[zone.zoneNumber] = newZoneData;
                }
                else if (zone.orderType === "SELL") {
                    cashFlow = cashFlow + (zone.moneyReceived - zone.moneySpent);
                    newZoneData = zone;
                    newZoneData.inOrder = false;
                    newZoneData.isBuy = false;
                    newZoneData.cryptoReceived = 0;
                    newZoneData.moneyReceived = 0;
                    newZoneData.moneySpent = 0;
                    newZoneData.orderType = "";
                    newZoneData.order = bitkubManage_2.OrderInit;
                    zones[zone.zoneNumber] = newZoneData;
                }
            }
            return [2 /*return*/];
        });
    });
}
function socketConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            IO.socket.on("connect", function (connection) {
                connection.on("message", function (res) {
                    var data = JSON.parse(res.utf8Data.split("\n")[0]);
                    currentPrice = data.rat;
                });
                connection.on("error", function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log("Socket Error", "error");
                                return [4 /*yield*/, IO.reconnect(socketConnection)];
                            case 1:
                                _a.sent();
                                log("Socket Reconnection", "system");
                                return [2 /*return*/];
                        }
                    });
                }); });
                connection.on("close", function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log("Socket Close", "system");
                                return [4 /*yield*/, IO.reconnect(socketConnection)];
                            case 1:
                                _a.sent();
                                log("Socket Reconnection", "system");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            IO.socket.on("connectFailed", function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log("Connect Error!!", "error");
                                return [4 /*yield*/, IO.reconnect(socketConnection)];
                            case 1:
                                _a.sent();
                                log("Socket Reconnection", "system");
                                return [2 /*return*/];
                        }
                    });
                });
            });
            return [2 /*return*/];
        });
    });
}
function displayLogs() {
    var beforeSelect = logs.slice(-15);
    console.log("/".repeat(65));
    beforeSelect.map(function (log) {
        console.log("\x1b[40m%s\x1b[0m", "" +
            ("[" + log.logType.padEnd(6, " ") + "] " + log.text.padEnd(35, " ") + " " + log.timestamp + " "));
    });
    console.log("/".repeat(65));
}
function displayZone() {
    // "\x1b[41m%s\x1b[0m" // Red
    // "\x1b[44m%s\x1b[0m" // Blue
    // "\x1b[42m%s\x1b[0m" // Green
    // "\x1b[46m%s\x1b[0m" // Cyan
    zones.map(function (zone) {
        var zoneNumber = zone.zoneNumber, startAt = zone.startAt, endAt = zone.endAt, isBuy = zone.isBuy, inOrder = zone.inOrder, orderType = zone.orderType;
        var arrow = "";
        var zoneNumberFormatted = zoneNumber.toString().padStart(3, "0");
        var startAtFormatted = startAt.toFixed(2).toString();
        var endAtFormatted = endAt.toFixed(2).toString();
        var zoneRange = startAtFormatted + " - " + endAtFormatted;
        var zoneRangeFormatted = zoneRange.padEnd(15, " ");
        var zoneStatus = "";
        var zoneColor = "46";
        if (currentPrice > startAt && currentPrice < endAt) {
            arrow = "<--- Current Price";
        }
        else {
            arrow = "";
        }
        if (inOrder === false && isBuy == false) {
            zoneStatus = "";
        }
        else if (inOrder === true) {
            if (orderType === "BUY") {
                zoneStatus = "In Order[BUY]";
                zoneColor = "42";
            }
            else if (orderType === "SELL") {
                zoneStatus = "In Order[SELL]";
                zoneColor = "41";
            }
        }
        console.log("\u001B[" + zoneColor + "m%s\u001B[0m", "Z[" + zoneNumberFormatted + "]: " + zoneRangeFormatted + " " + zoneStatus + " " + arrow);
    });
}
function generateZone(maxZone, minZone, amountZone) {
    var diff = maxZone - minZone;
    var lengthPerZone = diff / amountZone;
    var zone = [
        {
            zoneNumber: 0,
            startAt: minZone,
            endAt: fixedNumber(minZone + lengthPerZone),
            isBuy: false,
            cryptoReceived: 0,
            moneySpent: 0,
            moneyReceived: 0,
            inOrder: false,
            orderType: "",
            order: bitkubManage_2.OrderInit,
        },
    ];
    var test = minZone;
    for (var index = 0; index < amountZone - 1; index++) {
        var startAt = lengthPerZone + test;
        var endAt = test + lengthPerZone * 2;
        zone.push({
            zoneNumber: index + 1,
            startAt: fixedNumber(startAt),
            endAt: fixedNumber(endAt),
            isBuy: false,
            cryptoReceived: 0,
            moneySpent: 0,
            moneyReceived: 0,
            inOrder: false,
            orderType: "",
            order: bitkubManage_2.OrderInit,
        });
        test = test + lengthPerZone;
    }
    return zone.reverse();
}
function fixedNumber(number) {
    var newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
    return newNumber;
}
function updateOrderHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bitkubManage_1.default.getInstance().getMyOrder(cryptoName)];
                case 1:
                    result = _a.sent();
                    historyOrder = result;
                    return [2 /*return*/];
            }
        });
    });
}
function log(text, type) {
    var newDate = new Date()
        .toISOString()
        .replace(/T/, " ") // replace T with a space
        .replace(/\..+/, "");
    switch (type) {
        case "system":
            logs.push({
                text: text,
                timestamp: newDate,
                logType: "system",
            });
            break;
        case "common":
            logs.push({
                text: text,
                timestamp: newDate,
                logType: "common",
            });
            break;
        case "error":
            logs.push({
                text: text,
                timestamp: newDate,
                logType: "error",
            });
            break;
        default:
            console.log(text);
            break;
    }
}
init();
