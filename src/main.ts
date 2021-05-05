import { client as WebSocketClient } from "websocket";

var client = new WebSocketClient();
const cryptoName: string = "doge";
const zoneLangth: number = 20;
let centerLine: number = 20;
const zoneSpace: number = 0.03;
let zone: Array<any> = [];
let wallet: number = 1000000;
const capitalMoney = 1000000;
const buyAmount: number = 1000;

function main(): any {
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
    connection.on("message", function (message: any) {
      inState(message);
    });
  });

  client.connect(
    `wss://api.bitkub.com/websocket-api/market.trade.thb_${cryptoName}`
  );
}

function inState(message: any): any {
  console.clear();
  let json = JSON.parse(message.utf8Data.split("\n")[0]);
  const rat: number = json.rat;

  zone = zone.map((zoneObject) => {
    let zone = zoneObject;

    if (rat >= zoneObject.zoneValue + zoneSpace) {
      if (zoneObject.coin > 0 && zone.isBuy == true) {
        zone.status = "Sell";
        zone.isBuy = false;
        sell(zoneObject.coin, rat);
      }
    } else if (
      rat >= zoneObject.zoneValue &&
      rat < zoneObject.zoneValue + zoneSpace
    ) {
      if (zone.isBuy !== true) {
        zone.status = "Buy";
        zone.isBuy = true;
        zone.coin = buy(buyAmount, rat);
      }
    }

    return { ...zone };
  });

  console.log(`Received: ${rat} THB / ${cryptoName.toUpperCase()}`);
  console.log(`Money: ${wallet} THB`);
  console.log(`Cash Flow: ${wallet - capitalMoney} THB`);
  genGraph(rat);
}

function genGraph(currentPrice: number): any {
  zone.map((zoneObject) => {
    const formatedNumber: string = zoneObject.zoneValue
      .toString()
      .padStart(10, " ")
      .padEnd(15, " ");
    if (zoneObject.zoneValue === currentPrice) {
      console.log(
        "\x1b[43m%s\x1b[0m",
        `${formatedNumber}`,
        zoneObject.check(zoneObject)
      );
    } else if (zoneObject.zoneValue >= currentPrice) {
      console.log(
        "\x1b[41m%s\x1b[0m",
        `${formatedNumber}`,
        zoneObject.check(zoneObject)
      );
    } else {
      console.log(
        "\x1b[44m%s\x1b[0m",
        `${formatedNumber}`,
        zoneObject.check(zoneObject)
      );
    }
  });
}

function genZone(): Array<any> {
  const upSpaceZone: Array<any> = [];
  const downSpaceZone: Array<any> = [];

  let test: number = centerLine;
  for (let index = 0; index < zoneLangth; index++) {
    const numberSpace: any = test + zoneSpace;
    upSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
    test = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
  }

  let test2: number = centerLine;
  for (let index = 0; index < zoneLangth; index++) {
    const numberSpace: any = test2 - zoneSpace;
    downSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
    test2 = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
  }

  downSpaceZone.push(centerLine);

  let test3: Array<any> = upSpaceZone
    .concat(downSpaceZone)
    .sort((a: any, b: any) => a - b)
    .reverse();

  let objectZone: Array<object> = test3.map((value) => {
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

const checkItSelf = (zoneObject: any): any => {
  return zoneObject.status;
};

function buy(money: number, rat: number): any {
  let coin: number = money / rat;

  wallet = wallet - money;

  return coin;
}

function sell(coin: number, rat: number): any {
  let money: number = coin * rat;

  wallet = wallet + money;

  return money;
}

main();
