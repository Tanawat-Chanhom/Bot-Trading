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
exports.OrderInit = void 0;
var axios_1 = __importDefault(require("axios"));
var crypto_1 = __importDefault(require("crypto"));
var API_KEY = "316f12589c0b5d279c0447bbb08be7f1";
var API_SECRET = "dc5de89c44bf24f7683e84ec858646d5";
var API_HOST = "https://api.bitkub.com";
exports.OrderInit = {
    id: 0,
    hash: "",
    typ: "",
    amt: 0,
    rat: 0,
    fee: 0,
    cre: 0,
    rec: 0,
    ts: 0,
};
var BitkubManager = /** @class */ (function () {
    function BitkubManager(API_KEY, API_SECRET, API_HOST) {
        this.API_KEY = API_KEY;
        this.API_SECRET = API_SECRET;
        this.API_HOST = API_HOST;
        this.HEADER = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-BTK-APIKEY": API_KEY,
        };
    }
    BitkubManager.getInstance = function () {
        if (!BitkubManager.instance) {
            this.instance = new BitkubManager(API_KEY, API_SECRET, API_HOST);
        }
        return BitkubManager.instance;
    };
    /**
     * timeserver
     */
    BitkubManager.prototype.timeserver = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get(API_HOST + "/api/servertime")];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
     * Generate HMAC signature from json parameters
     */
    BitkubManager.prototype.generateSignature = function (json) {
        return crypto_1.default
            .createHmac("sha256", this.API_SECRET)
            .update(JSON.stringify(json))
            .digest("hex");
    };
    /**
     * Get crypto price by crypto name.
     */
    BitkubManager.prototype.getPrice = function (cryptoName) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get(this.API_HOST + "/api/market/ticker")];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data[cryptoName]];
                }
            });
        });
    };
    /**
     * Get data my order crypto in bitkub
     */
    BitkubManager.prototype.getMyOrder = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var body, sig, res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            sym: name
                        };
                        return [4 /*yield*/, this.timeserver()];
                    case 1:
                        body = (_a.ts = _b.sent(),
                            _a);
                        sig = this.generateSignature(body);
                        body["sig"] = sig;
                        return [4 /*yield*/, axios_1.default.post(API_HOST + "/api/market/my-open-orders", JSON.stringify(body), { headers: this.HEADER })];
                    case 2:
                        res = _b.sent();
                        return [2 /*return*/, res.data.result];
                }
            });
        });
    };
    /**
     * wallets
     */
    BitkubManager.prototype.wallets = function (filterByName) {
        return __awaiter(this, void 0, void 0, function () {
            var body, signature, res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.timeserver()];
                    case 1:
                        body = (_a.ts = _b.sent(),
                            _a);
                        signature = this.generateSignature(body);
                        body["sig"] = signature;
                        return [4 /*yield*/, axios_1.default.post(API_HOST + "/api/market/wallet", JSON.stringify(body), { headers: this.HEADER })];
                    case 2:
                        res = _b.sent();
                        if (typeof filterByName !== "undefined") {
                            return [2 /*return*/, res.data.result[filterByName]];
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * createBuy
     *
     */
    BitkubManager.prototype.createBuy = function (name, amoust, // THB
    rate, // THB/Crypto
    orderType) {
        return __awaiter(this, void 0, void 0, function () {
            var body, signature, res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            sym: name,
                            amt: amoust,
                            rat: rate,
                            typ: orderType
                        };
                        return [4 /*yield*/, this.timeserver()];
                    case 1:
                        body = (_a.ts = _b.sent(),
                            _a);
                        signature = this.generateSignature(body);
                        body["sig"] = signature;
                        return [4 /*yield*/, axios_1.default.post(API_HOST + "/api/market/place-bid", body, {
                                headers: this.HEADER,
                            })];
                    case 2:
                        res = _b.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    BitkubManager.prototype.createSell = function (name, amoust, //Crypto
    rate, orderType) {
        return __awaiter(this, void 0, void 0, function () {
            var body, signature, res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            sym: name,
                            amt: amoust,
                            rat: rate,
                            typ: orderType
                        };
                        return [4 /*yield*/, this.timeserver()];
                    case 1:
                        body = (_a.ts = _b.sent(),
                            _a);
                        signature = this.generateSignature(body);
                        body["sig"] = signature;
                        return [4 /*yield*/, axios_1.default.post(API_HOST + "/api/market/place-ask", body, {
                                headers: this.HEADER,
                            })];
                    case 2:
                        res = _b.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    return BitkubManager;
}());
exports.default = BitkubManager;
