import { client as WebSocketClient } from "websocket";

var HOST_WSS = "wss://api.bitkub.com";

class SocketIOManager {
  private static instance: SocketIOManager;
  public socket;

  private constructor(cryptoName?: string) {
    let newCrytoName = cryptoName?.split("_")[1].toLowerCase();
    this.socket = new WebSocketClient();
    this.socket.connect(
      HOST_WSS + "/websocket-api/market.trade.thb_" + newCrytoName
    );
  }

  public static getInstance(cryptoName?: string): SocketIOManager {
    if (!SocketIOManager.instance) {
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
}

export default SocketIOManager;
