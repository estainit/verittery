import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import {
  findTicketByHash,
  getLastWinner,
  calculateJSWinner,
} from "./VUtils.js";

import styles from "./PrizePool.css";

export function PrizePool({
  gameState,
  soldTickets,
  prizeAmountInToken,
  prizeAmountInDollar,
  selectedAddress,
  lastBlockTimestamp,
  lastTicketSellTime,
  reminedTimeToRevealing,
  revealTicketLuckyNumber,
  buyersBalance,
}) {
  const [dPMsg, setDPMsg] = useState("");
  const [ticketsClass, setTicketsClass] = useState({});

  const defClasses = "lNum";

  useEffect(() => {
    for (let elm of soldTickets) {
      ticketsClass[elm._id.toString()] = defClasses;
    }
  }, []);

  if (!soldTickets) return "Not sold any ticket yet!";

  let reminedTitle = `${lastBlockTimestamp}-${lastTicketSellTime}`;
  let winnerTicketHash = "";
  const theWinner = getLastWinner();
  if (theWinner) {
    winnerTicketHash = theWinner[3];
  }

  const showDrawing = () => {
    let lNumbers = [];
    for (let tick of soldTickets) {
      lNumbers.push(tick.ticketLuckyNumber.toNumber());
    }
    console.log("lNumbers ", lNumbers);
    let { stat, msg, winnerIndex, comparingTuples } =
      calculateJSWinner(lNumbers);
    console.log("comparingTuples ", comparingTuples);
    if (!stat) {
      setDPMsg(msg);
    } else {
      winnerIndex--;
      setDPMsg(
        "The winner number is " +
          lNumbers[winnerIndex] +
          " row number(" +
          (winnerIndex + 1) +
          ")"
      );
    }

    showDrawingGraphical(comparingTuples, 0);

    setDPMsg(
      "The winner number is " +
        lNumbers[winnerIndex] +
        " row number(" +
        (winnerIndex + 1) +
        ")"
    );
  };

  const resetNumberEffects = () => {
    let theTicketsClasses = {};
    for (let elm of soldTickets) {
      theTicketsClasses[elm._id] = defClasses;
    }
    setTicketsClass(theTicketsClasses);
    return theTicketsClasses;
  };

  const showDrawingGraphical = async (comparingTuples, roundNumber) => {
    if (roundNumber >= comparingTuples.length || roundNumber > 10000) return;

    setDPMsg(
      "Comparing " +
        comparingTuples[roundNumber].prevWinner.lNumber.toString() +
        " and " +
        comparingTuples[roundNumber].candid.lNumber.toString()
    );

    let tmpTicketsClass = {};
    for (let elm of soldTickets) {
      tmpTicketsClass[elm._id] = defClasses;
    }

    tmpTicketsClass[comparingTuples[roundNumber].prevWinner.index] =
      defClasses + " blob green";
    tmpTicketsClass[comparingTuples[roundNumber].candid.index] =
      defClasses + " blob yellow";
    setTicketsClass(tmpTicketsClass);

    const finalWinnerIndex = comparingTuples[roundNumber].finalWinner.index;
    setTimeout(() => {
      let resetedTicketsClass = resetNumberEffects();
      resetedTicketsClass[finalWinnerIndex] = defClasses + " tada blob green";
      console.log("::::", finalWinnerIndex);
      setTicketsClass(resetedTicketsClass);

      // call recursively
      setTimeout(() => {
        showDrawingGraphical(comparingTuples, roundNumber + 1);
      }, 1000);
    }, 3000);

    return;
  };

  let inx = 1;

  return (
    <div>
      <div className="position-relative">
        <div className="translate-middle-x display-4 p-3 mt-5 mb-5 p-2 bg-danger text-white">
          The only "Pick 4" Verifiable Lottery in the world
        </div>
        <div className="translate-middle-x display-6 bg-success p-2">
          Prize Amount:{" "}
          {ethers.utils.formatEther(prizeAmountInToken).toString()} in ETH ={" "}
          {prizeAmountInDollar} $
        </div>
        <div className="translate-middle-x display-6">
          {soldTickets.length} Ticket(s) sold:{" "}
        </div>
      </div>
      <div>
        {gameState === 0 ? (
          <h2 title={reminedTitle}>
            {" "}
            {reminedTimeToRevealing} Seconds Remined to Revealing Phase{" "}
          </h2>
        ) : (
          ""
        )}

        <h3> {gameState === 1 ? "Reveal your ticket number!" : ""} </h3>
        <table className="table table-primary table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Hash</th>
              <th scope="col">Date</th>
              <th scope="col">Buyer</th>
              <th scope="col">Lucky Numbers</th>
            </tr>
          </thead>
          <tbody>
            {soldTickets.map((elm) => (
              <tr key={elm._id.toNumber()}>
                <td style={{ backgroundColor: "#" + elm.buyer.substr(2, 8) }}>
                  {elm._id.toNumber()}
                  {winnerTicketHash === elm.ticketHash ? "Winner" : " "}
                </td>
                <td>{elm.ticketHash.substr(0, 6)}</td>
                <td>{elm.buyDate}</td>
                <td title={elm.buyer}>
                  {elm.buyer.substr(0, 6)}...{elm.buyer.substr(38, 4)}{" "}
                  {elm.playerAliasName}
                  {selectedAddress.toString().toLowerCase() ===
                  elm.buyer.toString().toLowerCase()
                    ? " (You) "
                    : ""}
                  {buyersBalance[elm.buyer]
                    ? ethers.utils
                        .formatEther(buyersBalance[elm.buyer])
                        .toString()
                        .substring(0, 8)
                    : ""}
                </td>

                <td>
                  <div className={ticketsClass[elm._id.toNumber()]}>
                    {elm.ticketLuckyNumber.toString() !== "0" ? (
                      elm.ticketLuckyNumber.toString()
                    ) : selectedAddress.toString().toLowerCase() ===
                      elm.buyer.toString().toLowerCase() ? (
                      <button
                        disabled={gameState === 1 ? "" : "disabled"}
                        type="button"
                        className="btn btn-warning btn btn-sm"
                        onClick={() => {
                          revealTicketLuckyNumber(
                            elm.ticketHash,
                            findTicketByHash(elm.ticketHash).ticketLuckyNumber,
                            findTicketByHash(elm.ticketHash).theSalt
                          );
                        }}
                      >
                        Reveal ticket number
                      </button>
                    ) : (
                      "..."
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {gameState === 1 ? (
              <tr key="Summary">
                <td style={{ backgroundColor: "#f00" }} colSpan={4}>
                  <div>{dPMsg}</div>
                </td>
                <td>
                  <button
                    disabled={gameState === 1 ? "" : "disabled"}
                    type="button"
                    className="btn btn-warning btn btn-sm"
                    onClick={showDrawing}
                  >
                    Represent the draw process
                  </button>
                </td>
              </tr>
            ) : (
              <tr></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="badge bg-primary text-light">
        Pari-mutuel: each 100$ one more winner!
      </div>
      <div className="badge bg-danger text-light">
        Pari-mutuel: each 1000$ supper prize!
      </div>
    </div>
  );
}
