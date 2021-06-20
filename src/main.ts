import SocketIOManager from "./services/socketManager";
import BitkubManager from "./services/bitkubManage";

/*
 **
 ** Version 2: Variable
 **
 */
var rounding = 0;
const cryptoName: string = "THB_USDT";
var currentPrice: number = -1;
var timeInterval: number = 1000;
var historyOrder: Object[] = [];
var floatDecimalNumberFixed: number = 2;
var buyPerZone: number = 10; //THB
var isErrorSomewhere: boolean = false;
var cashFlow = 0;

// Zone Setting
var zones: any = [];
var maxZone: number = 32.5;
var minZone: number = 31.5;
var amountZone: number = 10;

// Type
type zone = {
  zoneNumber: number;
  startAt: number;
  endAt: number;
  isBuy: boolean;
  value: number;
  inOrder: boolean;
  order: object;
};

type logType = "system" | "common" | "error";

// New Version ----------------------------------------------------

async function init() {
  try {
    await (async () => {
      let socket = SocketIOManager.getInstance(cryptoName);
      socket.on("message", (res: any) => {
        let data = JSON.parse(res.utf8Data.split("\n")[0]);
        currentPrice = data.rat;
      });
    })()
      .then(() => {
        console.log("System--> Socket Connected!!");
      })
      .catch((error) => {
        log(error, "error");
      });

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

    if (isErrorSomewhere) {
      log("Error", "common");
      return;
    }
    setInterval(async () => {
      console.clear();
      // -----------------------------------------------------------------
      // const { result } = await BitkubManager.getInstance().getMyOrder(
      //   cryptoName
      // );
      // historyOrder = result;

      // -----------------------------------------------------------------
      log(cashFlow.toString() + " Cash Flow", "common");
      zones.map((zone: any, index: number) => {
        // buy(zone);
        // sell(zone);
        // checkOrderHistory(zone);
        display(zone);
      });
    }, timeInterval);
  } catch (error) {
    console.error(error);
  }
}

function display(zone: any) {
  let { zoneNumber, startAt, endAt, isBuy, value, inOrder, orderType, order } =
    zone;
  let arrow = "";
  // "\x1b[41m%s\x1b[0m" // Red
  // "\x1b[44m%s\x1b[0m" // Blue
  // "\x1b[42m%s\x1b[0m" // Green
  // "\x1b[46m%s\x1b[0m" // Cyan
  if (currentPrice > startAt && currentPrice < endAt) {
    arrow = "<--- Current Price";
  } else {
    arrow = "";
  }

  if (inOrder === false && isBuy == false) {
    console.log(
      ` Z[${zoneNumber}]: ${startAt.toFixed(2)} - ${endAt.toFixed(2)} ${arrow}`
    );
  } else if (inOrder === true) {
    if (orderType === "BUY") {
      console.log(
        "\x1b[42m%s\x1b[0m",
        "" +
          ` Z[${zoneNumber}]: ${startAt.toFixed(2)} - ${endAt.toFixed(
            2
          )} In Order[BUY] ${arrow}`
      );
    } else if (orderType === "SELL") {
      console.log(
        "\x1b[41m%s\x1b[0m",
        "" +
          ` Z[${zoneNumber}]: ${startAt.toFixed(2)} - ${endAt.toFixed(
            2
          )} In Order[SELL] ${arrow}`
      );
    }
  } else if (isBuy == true) {
    console.log(
      "\x1b[44m%s\x1b[0m",
      "" +
        ` Z[${zoneNumber}]: ${startAt.toFixed(2)} - ${endAt.toFixed(
          2
        )} In State Value: ${value} ${arrow}`
    );
  }
}

function generateZone(maxZone: number, minZone: number, amountZone: number) {
  let diff: number = maxZone - minZone;
  let lengthPerZone: number = diff / amountZone;

  let zone: Object[] = [
    {
      zoneNumber: 0,
      startAt: minZone,
      endAt: fixedNumber(minZone + lengthPerZone),
      isBuy: false,
      value: 0,
      inOrder: false,
      orderType: "",
      order: {},
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
      value: 0,
      inOrder: false,
      orderType: "",
      order: {},
    });
    test = test + lengthPerZone;
  }

  return zone;
}

async function buy(zone: any) {
  let wallet = await BitkubManager.getInstance().wallets("THB");
  if (wallet > 10) {
    if (zone.inOrder === false && currentPrice >= zone.startAt) {
      await BitkubManager.getInstance()
        .createBuy(cryptoName, buyPerZone, zone.startAt, "limit")
        .then(({ result }) => {
          let newZoneData = zone;
          newZoneData.inOrder = true;
          newZoneData.order = result;
          newZoneData.orderType = "BUY";
          zones[zone.zoneNumber] = newZoneData;
        })
        .catch((error) => {
          log(error, "error");
        });
    }
  }
}

async function sell(zone: any) {
  if (currentPrice >= zone.endAt && zone.isBuy === true) {
    let newZoneData = zone;
    newZoneData.inOrder = true;
    newZoneData.isBuy = false;
    newZoneData.value = 0;
    newZoneData.orderType = "SELL";
    zones[zone.zoneNumber] = newZoneData;
  }
}

async function checkOrderHistory(zone: any) {
  if (zone.order && zone.inOrder === true) {
    if (historyOrder.find((x: any) => x.id === zone.order.id)) {
      return;
    }
    if (zone.orderType === "BUY") {
      let newZoneData = zone;
      newZoneData.inOrder = false;
      newZoneData.isBuy = true;
      newZoneData.value = zone.order.rec;
      zones[zone.zoneNumber] = newZoneData;
    } else if (zone.orderType === "SELL") {
      cashFlow += zone.order.rec - zone.value;
      let newZoneData = zone;
      newZoneData.inOrder = false;
      newZoneData.isBuy = false;
      newZoneData.value = 0;
      newZoneData.order = {};
      zones[zone.zoneNumber] = newZoneData;
    }
  }
}

function fixedNumber(number: number): number {
  let newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
  return newNumber;
}

function log(text: string, type?: logType) {
  switch (type) {
    case "system":
      console.log(`System--> ${text}`);
      break;
    case "common":
      console.log(`Common--> ${text}`);
      break;
    case "error":
      console.log(`Error---> ${text}`);
      break;
    default:
      console.log(text);
      break;
  }
}

init();
