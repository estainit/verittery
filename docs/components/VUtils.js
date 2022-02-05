const { createHash } = require("crypto");

export function calculateJSWinner(lNumbers) {
  let soldTicketsCount = lNumbers.length;
  // insert one zero az first unused index in solidity
  const luNumbers = [0, ...lNumbers];

  let comparingTuples = [];
  let firstRevealedTicket = 0;
  for (let i = 1; i <= soldTicketsCount; i++) {
    if (luNumbers[i] > 0) {
      firstRevealedTicket = i;
      break;
    }
  }
  if (firstRevealedTicket == 0) {
    return {
      stat: false,
      msg: "None of tickets are revealed!",
      winnerIndex: 0,
      comparingTuples
    };
  }

  let winnerTicketIndex = firstRevealedTicket;
  for (let candidInx = 1; candidInx <= soldTicketsCount; candidInx++) {
    // this ticket already got as first winner
    if (candidInx == firstRevealedTicket) continue;

    // asigning two numbers to compare
    let winnerLuckyNumber = luNumbers[winnerTicketIndex]; // previous round winner
    // this ticket didn't revealed yet!
    if (luNumbers[candidInx] == 0) continue;

    let candidNumber = luNumbers[candidInx];

    let tmpObj = {
      prevWinner: { index: winnerTicketIndex, lNumber: winnerLuckyNumber },
      candid: { index: candidInx, lNumber: candidNumber },
      finalWinner: { index: winnerTicketIndex, lNumber: winnerLuckyNumber },
    };

    if (winnerLuckyNumber > 0 && candidNumber > 0) {
      if (winnerLuckyNumber == candidNumber) {
        // DO NOTHING! the first accurance of the equal number is winner
      } else {
        if (winnerLuckyNumber > candidNumber) {
          if (candidNumber > winnerLuckyNumber / 2 + 0.1) {
            winnerTicketIndex = candidInx;
            tmpObj.finalWinner = { index: candidInx, lNumber: candidNumber };
          }
        } else {
          if (winnerLuckyNumber < candidNumber / 2 + 0.1) {
            winnerTicketIndex = candidInx;
            tmpObj.finalWinner = { index: candidInx, lNumber: candidNumber };
          }
        }
      }
    }
    comparingTuples.push(tmpObj);
  }

  return {
    stat: true,
    msg: "Done",
    winnerIndex: winnerTicketIndex,
    comparingTuples,
  };
}

export function getStateClasses(gameState) {
  const stateClassesDef = [
    "bg-success circle-sm ",
    "bg-warning circle-sm ",
    "bg-danger circle-sm ",
    "bg-secondary circle-sm ",
  ];
  let stateClasses = [];
  for (let i = 0; i < 4; i++) {
    if (gameState === i) {
      stateClasses[i] = stateClassesDef[i];
    } else {
      stateClasses[i] = stateClassesDef[i] + " semiOpa ";
    }
  }
  return stateClasses;
}

export function saveNewWinner(winner) {
  let winners = localStorage.getItem("winners");
  if (!winners || winners === "" || winners === undefined)
    winners = JSON.stringify([]);
  winners = JSON.parse(winners);
  winners.push(winner);
  localStorage.setItem("winners", JSON.stringify(winners));
  console.log("winners", localStorage.getItem("winners"));
}

export function getLastWinner() {
  let winners = localStorage.getItem("winners");
  if (!winners || winners === "" || winners === undefined)
    winners = JSON.stringify([]);
  winners = JSON.parse(winners);
  if (winners.length === 0) return null;
  return winners[winners.length - 1];
}

export function saveNewTicket({
  ticketHash,
  ticketBuyDate,
  ticketLuckyNumber,
  ticketCount,
  aliasName,
  theSalt,
}) {
  let boughtTickets = localStorage.getItem("boughtTickets");
  if (!boughtTickets || boughtTickets === "" || boughtTickets === undefined)
    boughtTickets = JSON.stringify({});
  boughtTickets = JSON.parse(boughtTickets);
  boughtTickets[ticketHash] = {
    ticketHash,
    ticketBuyDate,
    ticketLuckyNumber,
    ticketCount,
    aliasName,
    theSalt,
  };
  localStorage.setItem("boughtTickets", JSON.stringify(boughtTickets));
  console.log("boughtTickets", localStorage.getItem("boughtTickets"));
}

export function findTicketByHash(key) {
  let boughtTickets = localStorage.getItem("boughtTickets");
  if (!boughtTickets || boughtTickets === "" || boughtTickets === undefined)
    return {};

  boughtTickets = JSON.parse(boughtTickets);
  for (let inx in boughtTickets) {
    if (inx === key) return boughtTickets[inx];
  }

  return {};
}

export function doSha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

export function generateRandom4Digits() {
  return parseInt(Math.random() * 9998) + 1;
}

export function getNow() {
  //   var day_names = new Array("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT");

  //   var month_names = new Array(
  //     "JAN",
  //     "FEB",
  //     "MAR",
  //     "APR",
  //     "MAY",
  //     "JUN",
  //     "JUL",
  //     "AUG",
  //     "SEP",
  //     "OCT",
  //     "NOV",
  //     "DEC"
  //   );

  var date = new Date();
  var curr_date = date.getDate();
  var curr_month = date.getMonth() + 1;
  var curr_year = date.getFullYear();
  var cur_hour = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var miliseconds = date.getMilliseconds();
  //   var AMorPM = cur_hour >= 12 ? (AMorPM = "PM") : (AMorPM = "AM");
  cur_hour = cur_hour > 12 ? (cur_hour -= 12) : cur_hour;

  if (cur_hour < 10) cur_hour = "0" + cur_hour;
  if (minutes < 10) minutes = "0" + minutes;

  var finalDate =
    curr_year +
    "-" +
    curr_month +
    "-" +
    curr_date +
    " " +
    cur_hour +
    ":" +
    minutes +
    ":" +
    seconds +
    "." +
    miliseconds;

  return finalDate;
}
