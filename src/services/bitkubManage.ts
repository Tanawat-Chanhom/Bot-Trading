import axios from "axios";
import crypto from "crypto";

var API_KEY: string = "316f12589c0b5d279c0447bbb08be7f1";
var API_SECRET: string = "dc5de89c44bf24f7683e84ec858646d5";
var API_HOST: string = "https://api.bitkub.com";

type orderType = "limit" | "market";

type cryptoInfo = {
  id: number;
  last: number;
  lowestAsk: number;
  highestBid: number;
  percentChange: number;
  baseVolume: number;
  quoteVolume: number;
  isFrozen: number;
  high24hr: number;
  low24hr: number;
  change: number;
  prevClose: number;
  prevOpen: number;
};

export type Order = {
  id: number;
  hash: string;
  typ: string;
  amt: number;
  rat: number;
  fee: number;
  cre: number;
  rec: number;
  ts: number;
};

export const OrderInit: Order = {
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

export type MyOrder = {
  id: number;
  hash: string;
  side: string;
  type: string;
  rate: string;
  fee: string;
  credit: string;
  amount: string;
  receive: string;
  parent_id: number;
  super_id: number;
  ts: number;
};

type responseOrder = {
  error: number;
  result: Order;
};

class BitkubManager {
  private static instance: BitkubManager;
  private API_KEY: string;
  private API_SECRET: string;
  private API_HOST: string;
  private HEADER: object;

  constructor(API_KEY: string, API_SECRET: string, API_HOST: string) {
    this.API_KEY = API_KEY;
    this.API_SECRET = API_SECRET;
    this.API_HOST = API_HOST;
    this.HEADER = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-BTK-APIKEY": API_KEY,
    };
  }

  public static getInstance(): BitkubManager {
    if (!BitkubManager.instance) {
      this.instance = new BitkubManager(API_KEY, API_SECRET, API_HOST);
    }
    return BitkubManager.instance;
  }

  /**
   * timeserver
   */
  public async timeserver(): Promise<number> {
    let res = await axios.get(API_HOST + "/api/servertime");
    return res.data;
  }

  /**
   * Generate HMAC signature from json parameters
   */
  private generateSignature(json: object): string {
    return crypto
      .createHmac("sha256", this.API_SECRET)
      .update(JSON.stringify(json))
      .digest("hex");
  }

  /**
   * Get crypto price by crypto name.
   */
  public async getPrice(cryptoName: string): Promise<cryptoInfo> {
    let { data } = await axios.get(this.API_HOST + "/api/market/ticker");
    return data[cryptoName];
  }

  /**
   * Get data my order crypto in bitkub
   */
  public async getMyOrder(name: string): Promise<MyOrder[]> {
    let body: any = {
      sym: name,
      ts: await this.timeserver(),
    };

    let sig = this.generateSignature(body);
    body["sig"] = sig;
    let res = await axios.post(
      API_HOST + "/api/market/my-open-orders",
      JSON.stringify(body),
      { headers: this.HEADER }
    );
    return res.data.result;
    // [
    //   {
    //     id: 8739399,
    //     hash: 'fwQ6dnQWQQYbeVVNQM2UmELkB2p',
    //     side: 'BUY',
    //     type: 'limit',
    //     rate: '31.40',
    //     fee: '0.03',
    //     credit: '0.03',
    //     amount: '9.74',
    //     receive: '0.31000000',
    //     parent_id: 0,
    //     super_id: 0,
    //     ts: 1624112468
    //   }
    // ]
  }

  /**
   * wallets
   */
  public async wallets(filterByName?: string): Promise<any> {
    let body: any = {
      ts: await this.timeserver(),
    };
    let signature = this.generateSignature(body);
    body["sig"] = signature;

    const res = await axios.post(
      API_HOST + "/api/market/wallet",
      JSON.stringify(body),
      { headers: this.HEADER }
    );
    if (typeof filterByName !== "undefined") {
      return res.data.result[filterByName];
    }
    return res;
  }

  /**
   * createBuy
   *
   */
  public async createBuy(
    name: string,
    amoust: number, // THB
    rate: number, // THB/Crypto
    orderType: orderType
  ): Promise<responseOrder> {
    let body: any = {
      sym: name,
      amt: amoust,
      rat: rate,
      typ: orderType,
      ts: await this.timeserver(),
    };

    let signature = this.generateSignature(body);
    body["sig"] = signature;

    const res = await axios.post(API_HOST + "/api/market/place-bid", body, {
      headers: this.HEADER,
    });
    return res.data;
  }

  public async createSell(
    name: string,
    amoust: number, //Crypto
    rate: number,
    orderType: orderType
  ): Promise<responseOrder> {
    let body: any = {
      sym: name,
      amt: amoust,
      rat: rate,
      typ: orderType,
      ts: await this.timeserver(),
    };

    let signature = this.generateSignature(body);
    body["sig"] = signature;

    const res = await axios.post(API_HOST + "/api/market/place-ask", body, {
      headers: this.HEADER,
    });
    return res.data;
  }
}

export default BitkubManager;
