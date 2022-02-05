import React, { useState } from "react";

import { generateRandom4Digits } from "./VUtils.js";

import styles from "./SellTicket.css";

// export default SellTicket;

export function SellTicket({ onBuyTicket }) {
  const [ticketLuckyNumber, setTicketLuckyNumber] = useState(0);
  const [ticketCount, setTicketCount] = useState(1);
  const [aliasName, setAliasName] = useState("");

  return (
    <div className="bg-lightp-3 m-2 p-2 rounded bg-info text-dark position-relative">
      <center>
        <h4 className="translate-middle">Verittery (Verrifiable Lottery)</h4>
      </center>
      <div>
        <table>
          <tbody>
            <tr>
              <td>Ticket Number (0001-9999): </td>
              <td>
                <input
                  type="text"
                  name="betAmount"
                  required
                  value={ticketLuckyNumber}
                  onChange={(event) => setTicketLuckyNumber(event.target.value)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary btn-circle btn-sm"
                  onClick={() =>
                    setTicketLuckyNumber(generateRandom4Digits())
                  }
                >
                  RNG
                </button>
                <div>
                  <h6>
                    Random Number Generator
                    <br />
                    create your own custom ticket number
                    <br />
                    between 0001 - 9999!
                  </h6>
                </div>
              </td>
            </tr>
            <tr>
              <td>Tickets (1 MATIC, each Ticket): </td>
              <td>
                <input
                  type="text"
                  name="ticketCount"
                  value={ticketCount}
                  required
                  onChange={(event) => setTicketCount(event.target.value)}
                />
              </td>
              <td>
                <h6>
                  Cashing Bonus: Every 7 tickets; one free ticket in next game!
                  <br />
                  Cashing Bonus: Every winer has a free ticket for next game!
                </h6>
              </td>
            </tr>
            <tr>
              <td>Player Alias Name: </td>
              <td>
                <input
                  type="text"
                  name="aliasName"
                  required
                  onChange={(event) => setAliasName(event.target.value)}
                />
              </td>
              <td>It is optional </td>
            </tr>
            <tr>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <input
          className="btn btn-primary"
          type="button"
          value=" Buy Ticket "
          onClick={() => onBuyTicket(ticketLuckyNumber, ticketCount, aliasName)}
        />
        <br />
        <br />
        <div></div>
        <p></p>
      </div>
    </div>
  );
}
