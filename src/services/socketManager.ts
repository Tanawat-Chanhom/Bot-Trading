import { client as WebSocketClient } from "websocket";

var HOST_WSS = "wss://api.bitkub.com";
var PATH_WSS_SOCKET = "/websocket-api/market.trade.thb_";

class SocketIOManager {
  private static instance: SocketIOManager;
  public socket;
  private crytoName: string;

  private constructor(cryptoName: string) {
    let newCrytoName = cryptoName?.split("_")[1].toLowerCase();
    this.crytoName = newCrytoName;
    this.socket = new WebSocketClient();
    this.socket.connect(HOST_WSS + PATH_WSS_SOCKET + this.crytoName);
  }

  public static getInstance(cryptoName?: string): SocketIOManager {
    if (!SocketIOManager.instance && cryptoName !== undefined) {
      SocketIOManager.instance = new SocketIOManager(cryptoName);
    }

    return SocketIOManager.instance;
  }

  /**
   * on
   */
  public on(event: any, callback: any) {
    return this.socket.on("connect", (connection) => {
      connection.on(event, (e) => {
        callback(e);
      });
    });
  }

  /**
   * reconnect
   */
  public async reconnect(callback: () => void): Promise<void> {
    this.socket = new WebSocketClient();
    this.socket.connect(HOST_WSS + PATH_WSS_SOCKET + this.crytoName);
    callback();
  }
}

export default SocketIOManager;
