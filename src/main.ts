import { client as WebSocketClient } from "websocket";
import SocketIOManager from "./services/socketManager";
import BitkubManager from "./services/bitkubManage";

// Version 1: Variable
// const cryptoName: string = "usdt";
// const zoneLangth: number = 20;
// let centerLine: number = 18;
// const zoneSpace: number = 0.03;
// let zone: Array<any> = [];
// let wallet: number = 1000000;
// const capitalMoney = 1000000;
// const buyAmount: number = 1000;

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

// Zone Setting
var zones: any = [];
var maxZone: number = 0;
var minZone: number = 0;
var amountZone: number = 20;

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

    setInterval(async () => {
      console.clear();
      console.log(rounding++);
      if (currentPrice !== -1) {
        console.log(currentPrice);
        // const { result } = await BitkubManager.getInstance().getMyOrder(
        //   cryptoName
        // );
        // historyOrder = result;
        zones.map((zone: any, index: number) => {
          console.log(zone, zone.startAt + (zone.endAt - zone.startAt) * 0.3);
          if (currentPrice >= zone.startAt && currentPrice <= zone.endAt) {
            if (
              currentPrice >= zone.startAt &&
              currentPrice <=
                zone.startAt + (zone.endAt - zone.startAt) * 0.3 &&
              zone.isBuy === false
            ) {
              let dataZone = zones[index];
              dataZone.isBuy = true;
              dataZone.value = 100;
              zones[index] = dataZone;
            }
            if (currentPrice >= zone.endAt && zone.isBuy === true) {
              //Sell
              let dataZone = zones[index];
              dataZone.isBuy = false;
              dataZone.value = 0;
              zones[index] = dataZone;
            }
          }
        });
      }
    }, timeInterval);
  } catch (error) {
    console.error(error);
  }
}

function generateZone(maxZone: number, minZone: number, amountZone: number) {
  let diff = maxZone - minZone;
  let lengthPerZone = diff / amountZone;

  let zone = [
    {
      zoneNumber: 0,
      startAt: minZone,
      endAt: fixedNumber(minZone + lengthPerZone),
      isBuy: false,
      value: 0,
    },
  ];
  let test = minZone;
  for (let index = 0; index < amountZone - 1; index++) {
    let startAt = lengthPerZone + test;
    let endAt = test + lengthPerZone * 2;
    zone.push({
      zoneNumber: index + 1,
      startAt: fixedNumber(startAt),
      endAt: fixedNumber(endAt),
      isBuy: false,
      value: 0,
    });
    test = test + lengthPerZone;
  }

  return zone;
}

function fixedNumber(number: number): number {
  let newNumber = parseFloat(number.toFixed(floatDecimalNumberFixed));
  return newNumber;
}

init();

// Old Version ----------------------------------------------------

// function inState(message: any): any {
//   console.clear();
//   let json = JSON.parse(message.utf8Data.split("\n")[0]);
//   const rat: number = json.rat;

//   zone = zone.map((zoneObject) => {
//     let zone = zoneObject;

//     if (rat >= zoneObject.zoneValue + zoneSpace) {
//       if (zoneObject.coin > 0 && zone.isBuy == true) {
//         zone.status = "Sell";
//         zone.isBuy = false;
//         sell(zoneObject.coin, rat);
//       }
//     } else if (
//       rat >= zoneObject.zoneValue &&
//       rat < zoneObject.zoneValue + zoneSpace
//     ) {
//       if (zone.isBuy !== true) {
//         zone.status = "Buy";
//         zone.isBuy = true;
//         zone.coin = buy(buyAmount, rat);
//       }
//     }

//     return { ...zone };
//   });

//   console.log(`Received: ${rat} THB / ${cryptoName.toUpperCase()}`);
//   console.log(`Money: ${wallet} THB`);
//   console.log(`Cash Flow: ${wallet - capitalMoney} THB`);
//   genGraph(rat);
// }

// function genGraph(currentPrice: number): any {
//   zone.map((zoneObject) => {
//     const formatedNumber: string = zoneObject.zoneValue
//       .toString()
//       .padStart(10, " ")
//       .padEnd(15, " ");
//     if (zoneObject.zoneValue === currentPrice) {
//       console.log(
//         "\x1b[43m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     } else if (zoneObject.zoneValue >= currentPrice) {
//       console.log(
//         "\x1b[41m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     } else {
//       console.log(
//         "\x1b[44m%s\x1b[0m",
//         `${formatedNumber}`,
//         zoneObject.check(zoneObject)
//       );
//     }
//   });
// }

// function genZone(): Array<any> {
//   const upSpaceZone: Array<any> = [];
//   const downSpaceZone: Array<any> = [];

//   let test: number = centerLine;
//   for (let index = 0; index < zoneLangth; index++) {
//     const numberSpace: any = test + zoneSpace;
//     upSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
//     test = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
//   }

//   let test2: number = centerLine;
//   for (let index = 0; index < zoneLangth; index++) {
//     const numberSpace: any = test2 - zoneSpace;
//     downSpaceZone.push(parseFloat(Number.parseFloat(numberSpace).toFixed(3)));
//     test2 = parseFloat(Number.parseFloat(numberSpace).toFixed(3));
//   }

//   downSpaceZone.push(centerLine);

//   let test3: Array<any> = upSpaceZone
//     .concat(downSpaceZone)
//     .sort((a: any, b: any) => a - b)
//     .reverse();

//   let objectZone: Array<object> = test3.map((value) => {
//     return {
//       zoneValue: value,
//       isBuy: false,
//       coin: 0,
//       status: "",
//       check: checkItSelf,
//     };
//   });

//   return objectZone;
// }

// const checkItSelf = (zoneObject: any): any => {
//   return zoneObject.status;
// };

// function buy(money: number, rat: number): any {
//   let coin: number = money / rat;

//   wallet = wallet - money;

//   return coin;
// }

// function sell(coin: number, rat: number): any {
//   let money: number = coin * rat;

//   wallet = wallet + money;

//   return money;
// }
