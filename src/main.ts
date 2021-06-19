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
var timeInterval = 1000;
var historyOrder = [];
var floatDecimalNumberFixed = 2;
var buyPerZone = 10; //THB

// Zone Setting
var zones: any = [];
var maxZone: number = 31.6;
var minZone: number = 31.2;
var amountZone: number = 3;

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

// New Version ----------------------------------------------------

async function init() {
  try {
    let socket = SocketIOManager.getInstance(cryptoName);
    socket.on("message", (res: any) => {
      let data = JSON.parse(res.utf8Data.split("\n")[0]);
      currentPrice = data.rat;
    });

    if (maxZone !== 0 && minZone !== 0) {
      zones = generateZone(maxZone, minZone, amountZone);
    } else {
      let res = await BitkubManager.getInstance().getPrice(cryptoName);
      zones = generateZone(res.high24hr, res.low24hr, amountZone);
    }

    console.log(zones);

    currentPrice = await (
      await BitkubManager.getInstance().getPrice(cryptoName)
    ).last;

    setInterval(async () => {
      // console.clear();
      console.log(currentPrice);

      // -----------------------------------------------------------------
      const { result } = await BitkubManager.getInstance().getMyOrder(
        cryptoName
      );
      historyOrder = result;
      // -----------------------------------------------------------------
      zones.map((zone: any, index: number) => {
        buy(zone);
        sell(zone);
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
    // if (
    //   currentPrice >= zone.startAt &&
    //   currentPrice <= zone.startAt + (zone.endAt - zone.startAt) * 0.3 &&
    //   zone.isBuy === false
    // ) {
    //   console.log(`Zone Index: ${zone.zoneNumber} is Buy`);
    // }
    if (zone.isBuy === false && currentPrice >= zone.startAt) {
      console.log(
        `Zone Index: ${zone.zoneNumber} is Buy, at rat: ${zone.startAt}`
      );

      let newZoneData = zone;
      newZoneData.inOrder = true;
      zones[zone.zoneNumber] = newZoneData;
    }
  }
}

async function sell(zone: any) {
  if (currentPrice >= zone.endAt && zone.isBuy === true) {
    console.log(`Zone Index: ${zone.zoneNumber} is Sell`);
  }
}

function fixedNumber(number: number): number {
  let newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
  return newNumber;
}

init();
