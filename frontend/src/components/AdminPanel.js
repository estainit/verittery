import React, { useState } from "react";
import { ethers } from "ethers";
import styles from "./AdminPanel.css";

export function AdminPanel({
  selectedAddress,
  ownerAddress,
  gameState,
  stateClasses,
  changeGameState,
  onPickWinner,
  onPickTheWinner,
  withdrawWinner,
  commissionAddress,
  getContractCommissionAddress,
  setContractCommissionAddress,
  currentGameCommission,
  getCurrentGameCommission,
  getTicketPriceInWei,
  ticketPriceInWei,
  setTicketPriceInWei,
  deleteCurrentGame,
}) {
  const [tPrice, setTPrice] = useState(0);
  const [ccAddr, setccAddr] = useState(0);

  const getTPriceInWei = () => {
    getTicketPriceInWei(1);
  };
  const getCCAddr = () => {
    getContractCommissionAddress(1);
  };

  if (selectedAddress !== ownerAddress.toString().toLowerCase()) return "";

  return (
    <div className="bg-lightp-3 m-2 p-2 rounded bg-primary text-dark position-relative">
      <center>
        <h4 className="translate-middle">Contract Admin Panle</h4>
      </center>
      <div>
        <table>
          <tbody>
            <tr>
              <td>Game State {gameState}</td>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <div className={stateClasses[0]}></div>
                      </td>
                      <td>
                        <div className={stateClasses[1]}> </div>
                      </td>
                      <td>
                        <div className={stateClasses[2]}>
                          <button
                            type="button"
                            className="btn btn-danger btn-circle btn-md"
                            onClick={() => onPickWinner(false)}
                          >
                            draw winner
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className={stateClasses[3]}></div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-circle btn-md"
                          onClick={deleteCurrentGame}
                        >
                          Delete Game
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn btn-sm"
                          onClick={() => {
                            changeGameState("OnGoing");
                          }}
                        >
                          On Going
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-warning btn btn-sm"
                          onClick={() => {
                            changeGameState("Revealing");
                          }}
                        >
                          Revealing
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm m-2"
                          onClick={() => onPickWinner(true)}
                        >
                          draw & Pay
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm m-2"
                          onClick={() => onPickTheWinner(false, true)}
                        >
                          recalculate winner
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn btn-sm"
                          onClick={() => {
                            changeGameState("Finished");
                          }}
                        >
                          Finished
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn btn-sm"
                          onClick={() => {
                            withdrawWinner();
                          }}
                        >
                          Withdraw Winner
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  type="button"
                  className="btn btn-primary btn-circle btn-md"
                >
                  draw winner
                </button>
                <div>
                  <h6
                    onClick={getCurrentGameCommission}
                    className="bg-secondary"
                  >
                    Current Game Commission:{" "}
                    {ethers.utils.formatEther(currentGameCommission).toString()}{" "}
                    ({currentGameCommission.toString()} Wei)
                    <br />
                    create your own custom ticket number
                    <br />
                    between 0 - 999,999!
                  </h6>
                </div>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Ticket price in Wei: </td>
              <td>
                <input
                  type="text"
                  name="tktPrice"
                  value={tPrice}
                  required
                  onChange={(event) => setTPrice(event.target.value)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger btn-circle btn-md"
                  onClick={() => setTicketPriceInWei(tPrice)}
                >
                  Set Ticket Price
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => getTPriceInWei()}
                >
                  Get Ticket Price
                </button>
                <br />
                {ethers.utils.formatEther(ticketPriceInWei).toString()} ETH
                <br />
                {ticketPriceInWei.toString()} Wei
              </td>
            </tr>

            <tr>
              <td>Contract Commission Address: </td>
              <td>
                <input
                  type="text"
                  name="cntAddr"
                  value={ccAddr}
                  required
                  onChange={(event) => setccAddr(event.target.value)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger btn-circle btn-md"
                  onClick={() => setContractCommissionAddress(ccAddr)}
                >
                  Set Commission Address
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => getCCAddr()}
                >
                  Get Commission Address
                </button>
                <br />
                {commissionAddress.toString()}
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
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
      </div>
    </div>
  );
}
