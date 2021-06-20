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
 ** Version 2: Variable
 **
 */
var rounding = 0;
var cryptoName = "THB_USDT";
var currentPrice = -1;
var timeInterval = 5000;
var historyOrder = [];
var floatDecimalNumberFixed = 2;
var buyPerZone = 10; //THB
var isErrorSomewhere = false;
// Zone Setting
var zones = [];
var maxZone = 31.6;
var minZone = 31.2;
var amountZone = 3;
// New Version ----------------------------------------------------
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var socket;
                            return __generator(this, function (_a) {
                                socket = socketManager_1.default.getInstance(cryptoName);
                                socket.on("message", function (res) {
                                    var data = JSON.parse(res.utf8Data.split("\n")[0]);
                                    currentPrice = data.rat;
                                });
                                return [2 /*return*/];
                            });
                        }); })()
                            .then(function () {
                            console.log("System--> Socket Connected!!");
                        })
                            .catch(function (error) {
                            log(error, "error");
                        })];
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
                    if (isErrorSomewhere) {
                        log("Error", "common");
                        return [2 /*return*/];
                    }
                    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, bitkubManage_1.default.getInstance().getMyOrder(cryptoName)];
                                case 1:
                                    result = (_a.sent()).result;
                                    historyOrder = result;
                                    // -----------------------------------------------------------------
                                    zones.map(function (zone, index) {
                                        buy(zone);
                                        sell(zone);
                                        checkOrderHistory(zone);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); }, timeInterval);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
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
            value: 0,
            inOrder: false,
            order: {},
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
            value: 0,
            inOrder: false,
            order: {},
        });
        test = test + lengthPerZone;
    }
    return zone;
}
function buy(zone) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bitkubManage_1.default.getInstance().wallets("THB")];
                case 1:
                    wallet = _a.sent();
                    if (!(wallet > 10)) return [3 /*break*/, 3];
                    if (!(zone.inOrder === false && currentPrice >= zone.startAt)) return [3 /*break*/, 3];
                    return [4 /*yield*/, bitkubManage_1.default.getInstance()
                            .createBuy(cryptoName, buyPerZone, zone.startAt, "limit")
                            .then(function (_a) {
                            var result = _a.result;
                            console.log("Zone Index: " + zone.zoneNumber + ", Order at : " + zone.startAt);
                            var newZoneData = zone;
                            newZoneData.inOrder = true;
                            newZoneData.order = result;
                            zones[zone.zoneNumber] = newZoneData;
                            console.log(zones[zone.zoneNumber]);
                        })
                            .catch(function (error) {
                            log(error, "error");
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function sell(zone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (currentPrice >= zone.endAt && zone.isBuy === true) {
                console.log("Zone Index: " + zone.zoneNumber + " is Sell");
            }
            return [2 /*return*/];
        });
    });
}
function checkOrderHistory(zone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (zone.order && zone.inOrder === true) {
                console.log("Check order at zone: ", zone.zoneNumber, historyOrder.find(function (x) { return x.id === zone.order.id; }));
            }
            return [2 /*return*/];
        });
    });
}
function fixedNumber(number) {
    var newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
    return newNumber;
}
function log(text, type) {
    switch (type) {
        case "system":
            console.log("System--> " + text);
            break;
        case "common":
            console.log("Common--> " + text);
            break;
        case "error":
            console.log("Error---> " + text);
            break;
        default:
            console.log(text);
            break;
    }
}
init();
