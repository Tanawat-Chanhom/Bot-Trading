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
var timeInterval: number = 5000;
var historyOrder: Object[] = [];
var floatDecimalNumberFixed: number = 2;
var buyPerZone: number = 10; //THB
var isErrorSomewhere: boolean = false;

// Zone Setting
var zones: any = [];
var maxZone: number = 31.6;
var minZone: number = 31.2;
var amountZone: number = 5;

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
      // -----------------------------------------------------------------
      const { result } = await BitkubManager.getInstance().getMyOrder(
        cryptoName
      );
      historyOrder = result;

      // -----------------------------------------------------------------
      zones.map((zone: any, index: number) => {
        buy(zone);
        sell(zone);
        checkOrderHistory(zone);
      });
    }, timeInterval);
  } catch (error) {
    console.error(error);
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
          console.log(
            `Zone Index: ${zone.zoneNumber}, Order at : ${zone.startAt}`
          );
          let newZoneData = zone;
          newZoneData.inOrder = true;
          newZoneData.order = result;
          zones[zone.zoneNumber] = newZoneData;
          console.log(zones[zone.zoneNumber]);
        })
        .catch((error) => {
          log(error, "error");
        });
    }
  }
}

async function sell(zone: any) {
  if (currentPrice >= zone.endAt && zone.isBuy === true) {
    console.log(`Zone Index: ${zone.zoneNumber} is Sell`);
  }
}

async function checkOrderHistory(zone: any) {
  if (zone.order && zone.inOrder === true) {
    if (historyOrder.find((x: any) => x.id === zone.order.id)) {
      return;
    }
    let newZoneData = zone;
    newZoneData.inOrder = false;
    newZoneData.isBuy = true;
    newZoneData.value = zone.order.rec;
    zones[zone.zoneNumber] = newZoneData;
    console.log(`Zone Index: ${zone.zoneNumber}, Buy at : ${zone.startAt}, `);
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
