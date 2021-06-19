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
// Version 1: Variable
// const cryptoName: string = "usdt";
// const zoneLangth: number = 20;
// let centerLine: number = 18;
// const zoneSpace: number = 0.03;
// let zone: Array<any> = [];
// let wallet: number = 1000000;
// const capitalMoney = 1000000;
// const buyAmount: number = 1000;
/*
 **
 ** Version 2: Variable
 **
 */
var rounding = 0;
var cryptoName = "THB_USDT";
var currentPrice = -1;
var timeInterval = 1000;
var historyOrder = [];
var floatDecimalNumberFixed = 2;
// Zone Setting
var zones = [];
var maxZone = 0;
var minZone = 0;
var amountZone = 20;
// New Version ----------------------------------------------------
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var socket, res, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    socket = socketManager_1.default.getInstance(cryptoName);
                    socket.on("message", function (res) {
                        var data = JSON.parse(res.utf8Data.split("\n")[0]);
                        currentPrice = data.rat;
                    });
                    if (!(maxZone !== 0 && minZone !== 0)) return [3 /*break*/, 1];
                    zones = generateZone(maxZone, minZone, amountZone);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, bitkubManage_1.default.getInstance().getPrice(cryptoName)];
                case 2:
                    res = _a.sent();
                    zones = generateZone(res.high24hr, res.low24hr, amountZone);
                    _a.label = 3;
                case 3:
                    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.clear();
                            console.log(rounding++);
                            if (currentPrice !== -1) {
                                console.log(currentPrice);
                                // const { result } = await BitkubManager.getInstance().getMyOrder(
                                //   cryptoName
                                // );
                                // historyOrder = result;
                                zones.map(function (zone, index) {
                                    console.log(zone, zone.startAt + (zone.endAt - zone.startAt) * 0.3);
                                    if (currentPrice >= zone.startAt && currentPrice <= zone.endAt) {
                                        if (currentPrice >= zone.startAt &&
                                            currentPrice <=
                                                zone.startAt + (zone.endAt - zone.startAt) * 0.3 &&
                                            zone.isBuy === false) {
                                            var dataZone = zones[index];
                                            dataZone.isBuy = true;
                                            dataZone.value = 100;
                                            zones[index] = dataZone;
                                        }
                                        if (currentPrice >= zone.endAt && zone.isBuy === true) {
                                            //Sell
                                            var dataZone = zones[index];
                                            dataZone.isBuy = false;
                                            dataZone.value = 0;
                                            zones[index] = dataZone;
                                        }
                                    }
                                });
                            }
                            return [2 /*return*/];
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
        });
        test = test + lengthPerZone;
    }
    return zone;
}
function fixedNumber(number) {
    var newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
    return newNumber;
}
init();
// Old Version ----------------------------------------------------
// function inState(message: any): any {
//   console.clear();
//   let json = JSON.parse(message.utf8Data.split("\n")[0]);
//   const rat: number = json.rat;
//   zone = zone.map((zoneObject) => {
//     let zone = zoneObject;
//     if (rat >= zoneObject.zoneValue + zoneSpace) {
//       if (zoneObject.coin > 0 && zone.isBuy == true) {
//         zone.status = "Sell";
//         zone.isBuy = false;
//         sell(zoneObject.coin, rat);
//       }
//     } else if (
//       rat >= zoneObject.zoneValue &&
//       rat < zoneObject.zoneValue + zoneSpace
//     ) {
//       if (zone.isBuy !== true) {
//         zone.status = "Buy";
//         zone.isBuy = true;
//         zone.coin = buy(buyAmount, rat);
//       }
//     }
//     return { ...zone };
//   });
//   console.log(`Received: ${rat} THB / ${cryptoName.toUpperCase()}`);
//   console.log(`Money: ${wallet} THB`);
//   console.log(`Cash Flow: ${wallet - capitalMoney} THB`);
//   genGraph(rat);
// }
// function genGraph(currentPrice: number): any {
//   zone.map((zoneObject) => {
//     const formatedNumber: string = zoneObject.zoneValue
//       .toString()
//       .padStart(10, " ")
//       .padEnd(15, " ");
//     if (zoneObject.zoneValue === currentPrice) {
//       console.log(
//         "\x1b[43m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     } else if (zoneObject.zoneValue >= currentPrice) {
//       console.log(
//         "\x1b[41m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     } else {
//       console.log(
//         "\x1b[44m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     }
//   });
// }
// function genZone(): Array<any> {
//   const upSpaceZone: Array<any> = [];
//   const downSpaceZone: Array<any> = [];
//   let test: number = centerLine;
//   for (let index = 0; index < zoneLangth; index++) {
//     const numberSpace: any = test + zoneSpace;
//     upSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
//     test = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
//   }
//   let test2: number = centerLine;
//   for (let index = 0; index < zoneLangth; index++) {
//     const numberSpace: any = test2 - zoneSpace;
//     downSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
//     test2 = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
//   }
//   downSpaceZone.push(centerLine);
//   let test3: Array<any> = upSpaceZone
//     .concat(downSpaceZone)
//     .sort((a: any, b: any) => a - b)
//     .reverse();
//   let objectZone: Array<object> = test3.map((value) => {
//     return {
//       zoneValue: value,
//       isBuy: false,
//       coin: 0,
//       status: "",
//       check: checkItSelf,
//     };
//   });
//   return objectZone;
// }
// const checkItSelf = (zoneObject: any): any => {
//   return zoneObject.status;
// };
// function buy(money: number, rat: number): any {
//   let coin: number = money / rat;
//   wallet = wallet - money;
//   return coin;
// }
// function sell(coin: number, rat: number): any {
//   let money: number = coin * rat;
//   wallet = wallet + money;
//   return money;
// }
