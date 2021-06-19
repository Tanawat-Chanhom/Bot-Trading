import axios from "axios";
import crypto from "crypto";

var API_KEY = "316f12589c0b5d279c0447bbb08be7f1";
var API_SECRET = "dc5de89c44bf24f7683e84ec858646d5";
var API_HOST = "https://api.bitkub.com";

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
  public async getPrice(name: string): Promise<cryptoInfo> {
    let { data } = await axios.get(this.API_HOST + "/api/market/ticker");
    return data[name];
  }

  /**
   * Get data my order crypto in bitkub
   */
  public async getMyOrder(name: string): Promise<any> {
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
    return res.data;
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
   */
  public async createBuy(
    name: string,
    amoust: number,
    rate: number,
    orderType: orderType
  ): Promise<any> {
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
    amoust: number,
    rate: number,
    orderType: orderType
  ): Promise<any> {
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
