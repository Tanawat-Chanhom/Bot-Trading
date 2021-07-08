import SocketIOManager from "./services/socketManager";
import BitkubManager from "./services/bitkubManage";

/*
 **
 ** Version 2: Variable 461.86
 **
 */
const cryptoName: string = "THB_USDT";
var circle: number = 0;
var circleInprogress: boolean = false;
var currentPrice: number = -1;
var timeInterval: number = 1000;
var historyOrder: MyOrder[] = [];
var floatDecimalNumberFixed: number = 2;
var cashFlow: number = 0;
var logs: log[] = [];

// Zone Setting
var zones: Zone[] = [];
var maxZone: number = 35.0;
var minZone: number = 30.0;
var amountZone: number = 5; //Zone
var buyPerZone: number = 20; //THB

// Type
type Zone = {
  zoneNumber: number;
  startAt: number;
  endAt: number;
  isBuy: boolean;
  cryptoReceived: number;
  moneySpent: number;
  moneyReceived: number;
  inOrder: boolean;
  orderType: "BUY" | "SELL" | "";
  order: Order;
};
type logType = "system" | "common" | "error";
interface log {
  text: string;
  timestamp: string;
  logType: logType;
}
import { Order, MyOrder, OrderInit } from "./services/bitkubManage";

let IO = SocketIOManager.getInstance(cryptoName);

async function init() {
  try {
    await socketConnection();

    await (async () => {
      if (maxZone !== 0 && minZone !== 0) {
        zones = generateZone(maxZone, minZone, amountZone);
      } else {
        let res = await BitkubManager.getInstance().getPrice(cryptoName);
        zones = generateZone(res.high24hr, res.low24hr, amountZone);
      }
    })()
      .then(() => {
        log("Generate Zone Successfully", "system");
      })
      .catch((error) => {
        log(error, "error");
      });

    await (async () => {
      currentPrice = await (
        await BitkubManager.getInstance().getPrice(cryptoName)
      ).last;
    })()
      .then(() => {
        log("Get CurrentPrice Successfully", "system");
      })
      .catch((error) => {
        log(error, "error");
      });

    setInterval(() => {
      console.clear();
      console.log(
        `Cash Flow: ${cashFlow} THB | Current Price: ${currentPrice} | Circle: ${circle}`
      );
      displayLogs();
      displayZone();
    }, 1000);

    let checkingPrice: number = 0;
    setInterval(async () => {
      if (currentPrice !== checkingPrice && circleInprogress === false) {
        marketCircle();
        checkingPrice = currentPrice;
        circle++;
      }
    }, timeInterval);
  } catch (error) {
    log(error + "", "error");
    console.log("Catch: ", error);
  }
}

async function marketCircle(): Promise<void> {
  let zoneLength = zones.length;
  let zoneCount = 0;

  circleInprogress = true;
  zones.map(async (zone: any) => {
  buy(zone).then(() => {
    sell(zone).then(() => {
      zoneCount = zoneCount + 1;
      if (zoneLength === zoneCount) {
        circleInprogress = false;
      }
    });
  });
  });
}

async function buy(zone: Zone) {
  let wallet = await BitkubManager.getInstance().wallets("THB");
  if (wallet > 20) {
    await checkOrderHistory(zone).then(async () => {
      if (zone.inOrder === false && currentPrice >= zone.startAt) {
        await BitkubManager.getInstance()
          .createBuy(cryptoName, buyPerZone, zone.startAt, "limit")
          .then(({ result }) => {
            zone.inOrder = true;
            zone.order = result;
            zone.orderType = "BUY";
            zone.moneySpent = result.amt;
            zone.cryptoReceived = result.rec;
            log(
              `Zone ${zone.zoneNumber} is Order Buy [${result.amt}฿]`,
              "common"
            );
          })
          .catch((error) => {
            log(error, "error");
          });
      }
    });
    await updateOrderHistory();
  }
}

async function sell(zone: Zone) {
  await checkOrderHistory(zone).then(async () => {
    if (zone.isBuy === true) {
      await BitkubManager.getInstance()
        .createSell(cryptoName, zone.cryptoReceived, zone.endAt, "limit")
        .then(({ result }) => {
          let cryptoSpent = zone.cryptoReceived;
          zone.inOrder = true;
          zone.isBuy = false;
          zone.cryptoReceived = 0;
          zone.orderType = "SELL";
          zone.order = result;
          zone.moneyReceived = result.rec;
          log(
            `Zone ${zone.zoneNumber} is Order Sell [${cryptoSpent} ${
              cryptoName.split("_")[1]
            }]`,
            "common"
          );
        })
        .catch((err) => {
          log(err, "error");
        });
    }
  });

  await updateOrderHistory();
}

async function checkOrderHistory(zone: Zone) {
  if (zone.inOrder === true) {
    if (historyOrder.find((x: MyOrder) => x.id === zone.order.id)) {
      return;
    }
    if (zone.orderType === "BUY") {
      let newZoneData = zone;
      newZoneData.inOrder = false;
      newZoneData.isBuy = true;
      zones[zone.zoneNumber] = newZoneData;
    } else if (zone.orderType === "SELL") {
      cashFlow = cashFlow + (zone.moneyReceived - zone.moneySpent);
      let newZoneData = zone;
      newZoneData.inOrder = false;
      newZoneData.isBuy = false;
      newZoneData.cryptoReceived = 0;
      newZoneData.moneyReceived = 0;
      newZoneData.moneySpent = 0;
      newZoneData.orderType = "";
      newZoneData.order = OrderInit;

      zones[zone.zoneNumber] = newZoneData;
    }
  }
}

async function socketConnection(): Promise<void> {
  IO.socket.on("connect", (connection) => {
    connection.on("message", (res: any) => {
      let data = JSON.parse(res.utf8Data.split("\n")[0]);
      currentPrice = data.rat;
    });
    connection.on("error", async (res: any) => {
      log("Socket Error", "error");
      await IO.reconnect(socketConnection);
      log("Socket Reconnection", "system");
    });
    connection.on("close", async (res: any) => {
      log("Socket Close", "system");
      await IO.reconnect(socketConnection);
      log("Socket Reconnection", "system");
    });
  });

  IO.socket.on("connectFailed", async function () {
    log("Connect Error!!", "error");
    await IO.reconnect(socketConnection);
    log("Socket Reconnection", "system");
  });
}

function displayLogs() {
  let beforeSelect = logs.slice(-15);
  console.log("/".repeat(65));
  beforeSelect.map((log) => {
    console.log(
      "\x1b[40m%s\x1b[0m",
      "" +
        `[${log.logType.padEnd(6, " ")}] ${log.text.padEnd(35, " ")} ${
          log.timestamp
        } `
    );
  });
  console.log("/".repeat(65));
}

function displayZone() {
  // "\x1b[41m%s\x1b[0m" // Red
  // "\x1b[44m%s\x1b[0m" // Blue
  // "\x1b[42m%s\x1b[0m" // Green
  // "\x1b[46m%s\x1b[0m" // Cyan
  zones.map((zone: Zone) => {
    let { zoneNumber, startAt, endAt, isBuy, inOrder, orderType } = zone;
    let arrow = "";
    let zoneNumberFormatted = zoneNumber.toString().padStart(3, "0");
    let startAtFormatted = startAt.toFixed(2).toString();
    let endAtFormatted = endAt.toFixed(2).toString();
    let zoneRange = `${startAtFormatted} - ${endAtFormatted}`;
    let zoneRangeFormatted = zoneRange.padEnd(15, " ");
    let zoneStatus = "";
    let zoneColor = "46";

    if (currentPrice > startAt && currentPrice < endAt) {
      arrow = "<--- Current Price";
    } else {
      arrow = "";
    }

    if (inOrder === false && isBuy == false) {
      zoneStatus = "";
    } else if (inOrder === true) {
      if (orderType === "BUY") {
        zoneStatus = "In Order[BUY]";
        zoneColor = "42";
      } else if (orderType === "SELL") {
        zoneStatus = "In Order[SELL]";
        zoneColor = "41";
      }
    }

    console.log(
      `\x1b[${zoneColor}m%s\x1b[0m`,
      `Z[${zoneNumberFormatted}]: ${zoneRangeFormatted} ${zoneStatus} ${arrow}`
    );
  });
}

function generateZone(maxZone: number, minZone: number, amountZone: number) {
  let diff: number = maxZone - minZone;
  let lengthPerZone: number = diff / amountZone;

  let zone: Zone[] = [
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
      order: OrderInit,
    },
  ];
  let test: number = minZone;
  for (let index = 0; index < amountZone - 1; index++) {
    let startAt = lengthPerZone + test;
    let endAt = test + lengthPerZone * 2;
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
      order: OrderInit,
    });
    test = test + lengthPerZone;
  }

  return zone.reverse();
}

function fixedNumber(number: number): number {
  let newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
  return newNumber;
}

async function updateOrderHistory(): Promise<any> {
  const result = await BitkubManager.getInstance().getMyOrder(cryptoName);
  historyOrder = result;
}

function log(text: string, type?: logType) {
  let newDate = new Date()
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
