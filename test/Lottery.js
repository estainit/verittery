// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { createHash } = require("crypto");

function doSha256(str) {
  return createHash("sha256").update(str).digest("hex");
}

async function consoleAccountsDtl() {
  let accounts = await web3.eth.getAccounts();
  for (let inx in accounts) {
    let bal = await web3.eth.getBalance(accounts[inx]);
    let balH = web3.utils.fromWei(bal, "ether");
    console.log(`${inx}. ${accounts[inx]} ${balH} ETH(${bal})`);
  }
}
// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Lottery contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Lottery;
  let hardhatLottery;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addrs;
  const ETH_BY_WEI = 1000000000000000000;
  // const ticketPriceInWei = 1 * ETH_BY_WEI; //000000 * 100 * 10000000; // 100Gwei
  let contractCommissionRate = 10;

  const exp = ethers.BigNumber.from("10").pow(18);
  let ticketPriceInWei = ethers.BigNumber.from("1").mul(exp); // one ETH per ticket

  let ownerBalanceBefore;
  let addr2BalanceBefore;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    Lottery = await ethers.getContractFactory("Lottery");
    [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] =
      await ethers.getSigners();
    pledgeAmount = await web3.utils.toWei("100", "ether");

    // To deploy our contract, we just have to call Lottery.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been mined.
    hardhatLottery = await Lottery.deploy();
    await hardhatLottery.deployed();

    await hardhatLottery.setTicketPriceInWei(ticketPriceInWei);
    ticketPriceInWei = await hardhatLottery.getTicketPriceInWei();

    await hardhatLottery.setContractCommissionRate(contractCommissionRate);
    contractCommissionRate = await hardhatLottery.getContractCommissionRate();
  });

  function calculateJSWinner(lNumbers) {
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
        comparingTuples,
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

  // You can nest describe calls to create subsections.
  describe("Calculate winner in different sets", async () => {
    {
      it("control numbers 1, 1 and selects first 1 as winner", async () => {
        const luckyNumbers = [1, 1];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(winRes.events[0].args.winnerTicketInx.toNumber() - 1).to.equal(
          0
        );
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(1);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(1);
      });

      it("control numbers 1, 1, 1 and selects first 1 as winner", async () => {
        const luckyNumbers = [1, 1, 1];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(winRes.events[0].args.winnerTicketInx.toNumber() - 1).to.equal(
          0
        );
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(1);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(1);
        //console.log("comparingTuples", jsWinner.comparingTuples);
      });

      it("control numbers 1, 2 and selects 2 as winner", async () => {
        const luckyNumbers = [1, 2];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });

      it("control numbers 0, 1, 2 and selects 2 as winner", async () => {
        // zero represents for unrevealed numbers
        const luckyNumbers = [0, 1, 2];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });
    }

    {
      it("control numbers 2, 1 and selects 2 as winner", async () => {
        const luckyNumbers = [2, 1];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });
      it("control numbers 0, 2, 1 and selects 2 as winner", async () => {
        const luckyNumbers = [0, 2, 1];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });
    }

    {
      it("control numbers 1, 2, 3 and selects 2 as winner", async () => {
        const luckyNumbers = [1, 2, 3];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });

      it("control numbers 0, 1, 0, 2, 3 and selects 2 as winner", async () => {
        const luckyNumbers = [0, 1, 0, 2, 3];
        await hardhatLottery.dummyFillTickets(luckyNumbers);
        let winRes = await hardhatLottery.calculateWinner(true);
        winRes = await winRes.wait();
        expect(winRes.events[0].args.stat).to.equal(true);
        expect(
          luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
        ).to.equal(2);

        let jsWinner = calculateJSWinner(luckyNumbers);
        expect(jsWinner.stat).to.equal(true);
        expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(2);
      });
    }

    it("control numbers 1, 2, 3, 4 and selects 4 as winner", async () => {
      const luckyNumbers = [1, 2, 3, 4];
      await hardhatLottery.dummyFillTickets(luckyNumbers);
      let winRes = await hardhatLottery.calculateWinner(true);
      winRes = await winRes.wait();
      expect(winRes.events[0].args.stat).to.equal(true);
      expect(
        luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
      ).to.equal(4);

      let jsWinner = calculateJSWinner(luckyNumbers);
      expect(jsWinner.stat).to.equal(true);
      expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(4);
    });

    it("control numbers 1, 2, 3, 4, 5 and selects 4 as winner", async () => {
      const luckyNumbers = [1, 2, 3, 4, 5];
      await hardhatLottery.dummyFillTickets(luckyNumbers);
      let winRes = await hardhatLottery.calculateWinner(true);
      winRes = await winRes.wait();
      expect(winRes.events[0].args.stat).to.equal(true);
      expect(
        luckyNumbers[winRes.events[0].args.winnerTicketInx.toNumber() - 1]
      ).to.equal(4);

      let jsWinner = calculateJSWinner(luckyNumbers);
      expect(jsWinner.stat).to.equal(true);
      expect(luckyNumbers[jsWinner.winnerIndex - 1]).to.equal(4);
    });
  });

  // You can nest describe calls to create subsections.
  describe("Check winning algorithm", async () => {
    it("Should buy 2 tickets (lucky numbers 10 and 30) and pick winner and pay rewards to winner", async () => {
      await hardhatLottery.setContractPledgingAddress(addr2.address); // change pledge account address from owner to addr2

      // accounts balance checking
      // ownerBalanceBefore = ethers.BigNumber.from(
      //   await ethers.provider.getBalance(owner.address)
      // );
      // addr2BalanceBefore = ethers.BigNumber.from(
      //   await ethers.provider.getBalance(addr2.address)
      // );
      // console.log(
      //   "ownerBalanceBefore: ",
      //   ethers.utils.formatEther(ownerBalanceBefore)
      // );
      // console.log(
      //   "addr2BalanceBefore: ",
      //   ethers.utils.formatEther(addr2BalanceBefore)
      // );

      const tBDate1 = "2020-11-27 18:39:01.217";
      const tBDate2 = "2020-11-27 18:42:01.217";
      const aliasName1 = "dummyPlayer1";
      const aliasName2 = "dummyPlayer2";
      const tLuckyNumber1 = 2;
      const tLuckyNumber2 = 1;
      const theSalt1 = "theSalt1";
      const theSalt2 = "theSalt2";

      let tHash1 =
        tLuckyNumber1.toString() +
        ";" +
        tBDate1 +
        ";" +
        aliasName1 +
        ";" +
        theSalt1;
      tHash1 = doSha256(tHash1);

      {
        const soldTickets = await hardhatLottery.extractTickets();
        expect(soldTickets.length).to.equal(0);

        let [state, soldTicketsCount, prizeAmountInToken] =
          await hardhatLottery.getGameInfo();
        expect(soldTicketsCount.toString()).to.equal("0");
        expect(prizeAmountInToken.toString()).to.equal("0");
      }
      const tx1 = await hardhatLottery.buyATicket(
        tHash1,
        tBDate1,
        1,
        aliasName1,
        {
          value: ticketPriceInWei,
        }
      );
      const receipt1 = await tx1.wait();
      expect(ethers.BigNumber.from(tx1.value)).to.equal(ticketPriceInWei);

      let tHash2 =
        tLuckyNumber2.toString() +
        ";" +
        tBDate2 +
        ";" +
        aliasName2 +
        ";" +
        theSalt2;
      tHash2 = doSha256(tHash2);
      await hardhatLottery.buyATicket(tHash2, tBDate2, 1, aliasName2, {
        value: ticketPriceInWei.toString(),
      });

      {
        const soldTickets = await hardhatLottery.extractTickets();
        expect(soldTickets[0].buyer).to.equal(soldTickets[1].buyer);
      }

      // change game state to revealing
      {
        await hardhatLottery.changeGameState("Revealing");
        const [gameState] = await hardhatLottery.getGameInfo();
        expect(gameState).to.equal(1); // Revealing
      }

      // reveal the lucky number for ticket 1
      {
        await hardhatLottery.revealTicketLuckyNumber(
          tHash1,
          tLuckyNumber1,
          theSalt1
        );
        const soldTickets = await hardhatLottery.extractTickets();
        // console.log("soldTickets", soldTickets);
        expect(soldTickets[0].ticketLuckyNumber).to.equal(tLuckyNumber1);
      }

      // reveal the lucky number for ticket 2
      {
        await hardhatLottery.revealTicketLuckyNumber(
          tHash2,
          tLuckyNumber2,
          theSalt2
        );
        const soldTickets = await hardhatLottery.extractTickets();
        // console.log("soldTickets", soldTickets);
        expect(soldTickets[1].ticketLuckyNumber).to.equal(tLuckyNumber2);
      }

      // change game state to Drawing
      {
        await hardhatLottery.changeGameState("Drawing");
        const [gameState] = await hardhatLottery.getGameInfo();
        expect(gameState).to.equal(2); // Drawing
      }

      // accounts balance checking
      // ownerBalanceAfter = ethers.BigNumber.from(
      //   await ethers.provider.getBalance(owner.address)
      // );
      // addr2BalanceAfter = ethers.BigNumber.from(
      //   await ethers.provider.getBalance(addr2.address)
      // );
      // console.log(
      //   "ownerBalanceAfter: ",
      //   ethers.utils.formatEther(ownerBalanceAfter)
      // );
      // console.log(
      //   "addr2BalanceAfter: ",
      //   ethers.utils.formatEther(addr2BalanceAfter)
      // );

      // pick the winner
      {
        const winner = await hardhatLottery.pickWinner(false);
        // console.log("winner ", winner);
        const winnerEvt = await winner.wait();
        //console.log("winnerEvt ", winnerEvt);
        expect(winnerEvt.events[0].args.stat).to.equal(true);
        expect(winnerEvt.events[0].args.stat).to.equal(true);

        const finalWinner = winnerEvt.events[0].args.winner;
        expect(finalWinner.buyer).to.equal(owner.address);
        expect(finalWinner.ticketLuckyNumber.toNumber()).to.equal(2);

        console.log(
          "finalWinner ticketLuckyNumber",
          finalWinner.ticketLuckyNumber.toString()
        );
        console.log("finalWinner", finalWinner.buyer);

        // real payment
        {
          await hardhatLottery.withdrawWinner({
            value: await hardhatLottery.getNetPrizeAmountInToken(),
          });
          // // accounts balance checking
          // ownerBalanceAfter = ethers.BigNumber.from(
          //   await ethers.provider.getBalance(owner.address)
          // );
          // addr2BalanceAfter = ethers.BigNumber.from(
          //   await ethers.provider.getBalance(addr2.address)
          // );
          // console.log(
          //   "ownerBalanceAfter: ",
          //   ethers.utils.formatEther(ownerBalanceAfter)
          // );
          // console.log(
          //   "addr2BalanceAfter: ",
          //   ethers.utils.formatEther(addr2BalanceAfter)
          // );
        }

        // expect(winnerEvt.events.length).to.equal(1);
        // expect(winnerEvt.events[0].event).to.equal("LogPickedWinner");
        // expect(winnerEvt.events[0].args.stat).to.equal(true);
        // console.log(
        //   "winnerEvt.events[0].args.",
        //   winnerEvt.events[0].args.winner.ticketHash
        // );
        // expect(winnerEvt.events[0].args.message).to.equal("You can not draw winner in this stage");

        // const dummyFlagBytes = await hardhatLottery.pickDummyFlagBytes();
        // console.log("dummyFlagBytes ", dummyFlagBytes);
      }
    });
  });

  describe("Deployment", () => {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an assertion objet. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatLottery.owner()).to.equal(owner.address);
    });

    it("Should test a dummy paymant to contract (from owner to addr1)", async () => {
      expect(await ethers.utils.parseEther("1")).to.equal(
        await web3.utils.toWei("1", "ether")
      );

      expect(ethers.utils.formatEther("1000000000000000000")).to.equal(
        web3.utils.fromWei("1000000000000000000", "ether").toString() + ".0"
      );

      // consoleAccountsDtl();
    });

    it("Should buy one ticket for lottery game", async () => {
      let ownerBalanceBefore = ethers.BigNumber.from(
        await ethers.provider.getBalance(owner.address)
      );
      await hardhatLottery.setContractPledgingAddress(addr2.address); // change pledge account address from owner to addr2

      const tBDate1 = "2020-11-27 18:39:01.217";
      const tBDate2 = "2020-11-27 18:42:01.217";
      const aliasName1 = "dummyPlayer1";
      const aliasName2 = "dummyPlayer2";
      const tLuckyNumber1 = 1;
      const tLuckyNumber2 = 1;
      const theSalt1 = "theSalt1";
      const theSalt2 = "theSalt2";

      let tHash1 =
        tLuckyNumber1.toString() +
        ";" +
        tBDate1 +
        ";" +
        aliasName1 +
        ";" +
        theSalt1;
      tHash1 = doSha256(tHash1);

      {
        const soldTickets = await hardhatLottery.extractTickets();
        expect(soldTickets.length).to.equal(0);

        let [state, soldTicketsCount, prizeAmountInToken] =
          await hardhatLottery.getGameInfo();
        expect(soldTicketsCount.toString()).to.equal("0");
        expect(prizeAmountInToken.toString()).to.equal("0");
      }
      const tx1 = await hardhatLottery.buyATicket(
        tHash1,
        tBDate1,
        1,
        aliasName1,
        {
          value: ticketPriceInWei,
        }
      );
      const receipt1 = await tx1.wait();

      expect(ethers.BigNumber.from(tx1.value)).to.equal(ticketPriceInWei);

      const ownerBalanceAfter = ethers.BigNumber.from(
        await ethers.provider.getBalance(owner.address)
      );
      expect(
        parseFloat(
          ethers.utils.formatEther(ownerBalanceBefore.sub(ownerBalanceAfter))
        )
      ).to.greaterThan(parseFloat(ethers.utils.formatEther(ticketPriceInWei)));

      expect(receipt1.events.length).to.equal(1);
      expect(receipt1.events[0].event).to.equal("LogTicketSold");
      const {
        stat,
        buyer,
        soldTicketsCount,
        ticketHash,
        buyDate,
        playerAliasName,
      } = receipt1.events[0].args;
      expect(stat).to.equal(true);
      expect(tx1.from).to.equal(buyer);
      expect(soldTicketsCount).to.equal(1);
      expect(ticketHash).to.equal(tHash1);
      expect(buyDate).to.equal(tBDate1);
      expect(playerAliasName).to.equal(aliasName1);

      const soldTickets = await hardhatLottery.extractTickets();
      //console.log("soldTickets", soldTickets);
      expect(soldTickets.length).to.equal(1);
      expect(soldTickets[0]._id.toString()).to.equal("1");
      expect(soldTickets[0].buyer).to.equal(buyer);
      expect(soldTickets[0].ticketHash).to.equal(tHash1);
      expect(soldTickets[0].buyDate).to.equal(tBDate1);
      expect(soldTickets[0].playerAliasName).to.equal(aliasName1);

      let [state, soldTicketsCount_, prizeAmountInToken] =
        await hardhatLottery.getGameInfo();
      expect(soldTicketsCount_.toString()).to.equal("1");
      expect(ethers.utils.formatEther(prizeAmountInToken)).to.equal(
        ethers.utils.formatEther(
          ticketPriceInWei.sub(
            ticketPriceInWei.mul(contractCommissionRate).div(10000)
          )
        )
      );

      // sel second ticket
      let tHash2 =
        tLuckyNumber2.toString() +
        ";" +
        tBDate2 +
        ";" +
        aliasName2 +
        ";" +
        theSalt2;
      tHash2 = doSha256(tHash2);

      {
        const soldTickets = await hardhatLottery.extractTickets();
        expect(soldTickets.length).to.equal(1);

        let [state, soldTicketsCount, prizeAmountInToken] =
          await hardhatLottery.getGameInfo();
        expect(soldTicketsCount.toString()).to.equal("1");
        expect(ethers.utils.formatEther(prizeAmountInToken)).to.equal(
          ethers.utils.formatEther(
            ticketPriceInWei.sub(
              ticketPriceInWei.mul(contractCommissionRate).div(10000)
            )
          )
        );
      }

      await hardhatLottery.buyATicket(tHash2, tBDate2, 1, aliasName2, {
        value: ticketPriceInWei.toString(),
      });
      {
        const soldTickets = await hardhatLottery.extractTickets();
        expect(soldTickets.length).to.equal(2);
        expect(soldTickets[1]._id.toString()).to.equal("2");
        expect(soldTickets[1].buyer).to.equal(buyer);
        expect(soldTickets[1].ticketHash).to.equal(tHash2);
        expect(soldTickets[1].buyDate).to.equal(tBDate2);
        expect(soldTickets[1].playerAliasName).to.equal(aliasName2);
      }

      // normal game state
      {
        const [gameState] = await hardhatLottery.getGameInfo();
        expect(gameState).to.equal(0); // Ongoing
      }

      // change game state to revealing
      {
        const txChng = await hardhatLottery.changeGameState("Revealing");
        const [gameState] = await hardhatLottery.getGameInfo();
        expect(gameState).to.equal(1); // Revealing
      }

      // reveal the lucky number for ticket 1
      {
        await hardhatLottery.revealTicketLuckyNumber(
          tHash1,
          tLuckyNumber1,
          theSalt1
        );
        const soldTickets = await hardhatLottery.extractTickets();
        // console.log("soldTickets", soldTickets);
        expect(soldTickets[0].ticketLuckyNumber).to.equal(tLuckyNumber1);
      }

      // reveal the lucky number for ticket 2
      {
        await hardhatLottery.revealTicketLuckyNumber(
          tHash2,
          tLuckyNumber2,
          theSalt2
        );
        const soldTickets = await hardhatLottery.extractTickets();
        // console.log("soldTickets", soldTickets);
        expect(soldTickets[1].ticketLuckyNumber).to.equal(tLuckyNumber2);
      }

      // select winner in wrong game state
      {
        const winner = await hardhatLottery.pickWinner(false);
        const winnerEvt = await winner.wait();
        expect(winnerEvt.events.length).to.equal(1);
        expect(winnerEvt.events[0].event).to.equal("LogPickedWinner");
        expect(winnerEvt.events[0].args.stat).to.equal(false);
        expect(winnerEvt.events[0].args.message).to.equal(
          "You can not draw winner in this stage"
        );
      }

      // change game state to Drawing
      {
        await hardhatLottery.changeGameState("Drawing");
        const [gameState] = await hardhatLottery.getGameInfo();
        expect(gameState).to.equal(2); // Drawing
      }

      //getContractBalance
      {
        const contractBalance = await hardhatLottery.getContractBalance();
        console.log(
          "contractBalance",
          ethers.utils.formatEther(contractBalance)
        );
      }
    });
  });
});
