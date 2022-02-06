import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import { setTimeout } from "timers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import LotteryArtifact from "../contracts/Lottery.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.

import { saveNewTicket, saveNewWinner } from "./VUtils";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { AdminPanel } from "./AdminPanel";
import { Loading } from "./Loading";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { SellTicket } from "./SellTicket";
import { PrizePool } from "./PrizePool";
import { useCookies } from "react-cookie";

import { doSha256, getNow, getStateClasses } from "./VUtils.js";

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = "31337";
const ROPSTEN_TEST_NETWORK_ID = "3";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// const cookieManager = () => {
//   const [cookies, setCookie] = useCookies(["user"]);
// };

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  state = {
    // The info of the token (i.e. It's Name and symbol)
    tokenData: undefined,
    // The user's address and balance
    selectedAddress: undefined,
    balance: undefined,
    // The ID about transactions being sent, and any possible error with them
    txBeingSent: undefined,
    transactionError: undefined,
    networkError: undefined,

    _pollDataInterval: [],
    soldTickets: [],
    soldTicketsCount: 0,
    prizeAmountInToken: 0,
    prizeAmountInDollar: 0,
    ticketPriceInWei: 1000000 * 100,
    lastBlockTimestamp: 0,
    lastTicketSellTime: 0,
    stateClasses: getStateClasses(),
    ownerAddress: "",
    theWinner: {},
    buyersBalance: {},
    commissionAddress: "",
    currentGameCommission: 0,
    IDLE_PLAY_TIME: 10, // if in 10 minutes no new player join to game (no new ticket to be sold), the game goes to Revealing phase.
    reminedTimeToRevealing: 0,
    lockedForChangeGameState: false,
  };

  constructor(props) {
    super(props);

    //
    this._preInitialize();

    this._startPreConnectPollingData();
    //const [cookies, setCookie] = useCookies(['user']);
  }

  _preInitialize() {
    this._intializeEthers();
  }

  updateTicketsInfo = async () => {
    if (!this._lottery) return;

    let soldTickets = await this._lottery.extractTickets();
    this.setState({
      soldTickets,
    });

    let buyersBalance = {};
    for (let tick of soldTickets) {
      buyersBalance[tick.buyer] = await this.getBalance(tick.buyer);
    }

    let [
      gameState,
      soldTicketsCount,
      prizeAmountInToken,
      lastBlockTimestamp,
      lastTicketSellTime,
    ] = await this._lottery.getGameInfo();

    let stateClasses = getStateClasses(gameState);
    lastBlockTimestamp = lastBlockTimestamp.toString();
    lastTicketSellTime = lastTicketSellTime.toString();
    // console.log("lastBlockTimestamp: ", lastBlockTimestamp);
    // console.log("lastTicketSellTime: ", lastTicketSellTime);

    prizeAmountInToken = prizeAmountInToken.toString();
    soldTicketsCount = soldTicketsCount.toString();

    let reminedTimeToRevealing =
      this.state.IDLE_PLAY_TIME * 60 -
      (lastBlockTimestamp - lastTicketSellTime);

    this.setState({
      buyersBalance,
      gameState,
      stateClasses,
      soldTicketsCount,
      prizeAmountInToken,
      lastBlockTimestamp,
      lastTicketSellTime,
      reminedTimeToRevealing,
    });
    this.setState({ prizeAmountInDollar: prizeAmountInToken * 0.00000014 });

    if (reminedTimeToRevealing < 1 && gameState == 0) {
      if (!this.state.lockedForChangeGameState) {
        console.log("It is time to change the game state to Revealing");
        this.setState({ lockedForChangeGameState: true });
        // await this._lottery.changeGameState("Revealing");
        this.setState({ lockedForChangeGameState: false });
      }
    }
  };

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <div>
          <AdminPanel
            deleteCurrentGame={this.deleteCurrentGame}
            commissionAddress={this.state.commissionAddress}
            currentGameCommission={this.state.currentGameCommission}
            getCurrentGameCommission={this.getCurrentGameCommission}
            getContractCommissionAddress={this.getContractCommissionAddress}
            setContractCommissionAddress={this.setContractCommissionAddress}
            ticketPriceInWei={this.state.ticketPriceInWei}
            getTicketPriceInWei={this.getTicketPriceInWei}
            setTicketPriceInWei={this.setTicketPriceInWei}
            selectedAddress={this.state.selectedAddress}
            ownerAddress={this.state.ownerAddress}
            gameState={this.state.gameState}
            stateClasses={this.state.stateClasses}
            onPickWinner={this.pickWinner}
            onPickTheWinner={this.pickTheWinner}
            withdrawWinner={this.withdrawWinner}
            changeGameState={this.changeGameState}
          />

          <ConnectWallet
            connectWallet={() => this._connectWallet()}
            networkError={this.state.networkError}
            dismiss={() => this._dismissNetworkError()}
          />
          <PrizePool
            buyersBalance={this.state.buyersBalance}
            revealTicketLuckyNumber={this.revealTicketLuckyNumber}
            gameState={this.state.gameState}
            soldTickets={this.state.soldTickets}
            prizeAmountInToken={this.state.prizeAmountInToken}
            prizeAmountInDollar={this.state.prizeAmountInDollar}
            selectedAddress={""}
            lastBlockTimestamp={this.state.lastBlockTimestamp}
            lastTicketSellTime={this.state.lastTicketSellTime}
            reminedTimeToRevealing={this.state.reminedTimeToRevealing}
          />
        </div>
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    // if (!this.state.lastBlockTimestamp || !this.state.balance) {
    //   return <Loading />;
    // }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <PrizePool
              buyersBalance={this.state.buyersBalance}
              revealTicketLuckyNumber={this.revealTicketLuckyNumber}
              gameState={this.state.gameState}
              soldTickets={this.state.soldTickets}
              prizeAmountInToken={this.state.prizeAmountInToken}
              prizeAmountInDollar={this.state.prizeAmountInDollar}
              selectedAddress={this.state.selectedAddress}
              lastBlockTimestamp={this.state.lastBlockTimestamp}
              lastTicketSellTime={this.state.lastTicketSellTime}
              reminedTimeToRevealing={this.state.reminedTimeToRevealing}
            />
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immidiate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <SellTicket onBuyTicket={this.onBuyTicket} />
            <AdminPanel
              deleteCurrentGame={this.deleteCurrentGame}
              commissionAddress={this.state.commissionAddress}
              currentGameCommission={this.state.currentGameCommission}
              getCurrentGameCommission={this.getCurrentGameCommission}
              getContractCommissionAddress={this.getContractCommissionAddress}
              setContractCommissionAddress={this.setContractCommissionAddress}
              ticketPriceInWei={this.state.ticketPriceInWei}
              getTicketPriceInWei={this.getTicketPriceInWei}
              setTicketPriceInWei={this.setTicketPriceInWei}
              selectedAddress={this.state.selectedAddress}
              ownerAddress={this.state.ownerAddress}
              gameState={this.state.gameState}
              stateClasses={this.state.stateClasses}
              onPickWinner={this.pickWinner}
              onPickTheWinner={this.pickTheWinner}
              withdrawWinner={this.withdrawWinner}
              changeGameState={this.changeGameState}
            />
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    // const [selectedAddress] = await window.ethereum.enable();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const selectedAddress = accounts[0];

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initializeAfterWalletConnect(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initializeAfterWalletConnect(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initializeAfterWalletConnect(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    this._startPostConnectPollingData();
  }

  async _intializeEthers() {
    if (window.ethereum === undefined) {
      return;
    }
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );

    // init Lottery contract
    this._lottery = new ethers.Contract(
      contractAddress.Lottery,
      LotteryArtifact.abi,
      this._provider.getSigner(0)
    );
    await this._lottery.deployed();
    let ownerAddress = await this._lottery.owner();
    this.setState({ ownerAddress });
  }

  // FIXME: remove this dummy solution and put the pre-connect polling function in proper location in code in ordder to launch it when user still didn't connect its wallet.
  _startPreConnectPollingData = () => {
    setTimeout(() => {
      this.startPreConnectPollingData();
    }, 15000);
  };

  getBalance = async (addr) => {
    return await this._provider.getBalance(addr);
    // const balanceInEth = ethers.utils.formatEther(balance);
  };

  startPreConnectPollingData = () => {
    let _pollDataInterval = [...this.state._pollDataInterval];
    _pollDataInterval.push(setInterval(() => this.updateTicketsInfo(), 5000));
    this.setState({ _pollDataInterval });

    // We run it once immediately so we don't have to wait for it
    this.updateTicketsInfo();
  };

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPostConnectPollingData = () => {
    this.updateTicketsInfo();
  };

  _stopPollingData() {
    for (let interval of this.state._pollDataInterval) {
      clearInterval(interval);
    }
    this.setState({ _pollDataInterval: [] });
  }

  deleteCurrentGame = async () => {
    await this._lottery.deleteCurrentGame();
  };

  setContractCommissionAddress = async (addr) => {
    await this._lottery.setContractCommissionAddress(addr); // 0xBbC19F0575fAAdAd311823A20e7F20248F5c3B14 solar undo
  };

  getCurrentGameCommission = async () => {
    const currentGameCommission =
      await this._lottery.getCurrentGameCommission();
    this.setState({ currentGameCommission });
  };

  getContractCommissionAddress = async (sw) => {
    const commissionAddress =
      await this._lottery.getContractCommissionAddress();

    if (sw === 1) this.setState({ commissionAddress });

    return commissionAddress;
  };

  getTicketPriceInWei = async (sw) => {
    const ticketPriceInWei = await this._lottery.getTicketPriceInWei();

    if (sw === 1) this.setState({ ticketPriceInWei });

    return ticketPriceInWei;
  };

  setTicketPriceInWei = async (ticketPrice) => {
    const res = await this._lottery.setTicketPriceInWei(ticketPrice);
    await this.getTicketPriceInWei(1);
  };

  revealTicketLuckyNumber = async (ticketHash, ticketLuckyNumber, theSalt) => {
    if (!ticketHash || !ticketLuckyNumber || !theSalt) return false;

    await this._lottery.revealTicketLuckyNumber(
      ticketHash,
      ticketLuckyNumber.toString(),
      theSalt.toString()
    );

    // let dummyHashFlag32 = await this._lottery.pickDummyFlag32();
    // console.log("dummyHashFlag32 . . . ", dummyHashFlag32);

    // refresh local information
    await this.updateTicketsInfo();
  };

  changeGameState = async (stat) => {
    await this._lottery.changeGameState(stat);
    await this.updateTicketsInfo();
  };

  withdrawWinner = async () => {
    const value = await this._lottery.getNetPrizeAmountInToken();
    await this._lottery.withdrawWinner({ value });
    await this._lottery.changeGameState("Finished");
    await this.updateTicketsInfo();
  };

  pickWinner = async (shouldPayToWinner) => {
    await this._lottery.changeGameState("Drawing");
    await this.updateTicketsInfo();

    const winner = await this._lottery.pickWinner(shouldPayToWinner);
    const winnerEvt = await winner.wait();

    console.clear();
    console.log("winnerEvt ", winnerEvt);

    if (winnerEvt.events[0].args.stat)
      saveNewWinner(winnerEvt.events[0].args.winner);
  };

  pickTheWinner = async (shouldForceRecalculateWinner, shouldPayToWinner) => {
    await this._lottery.changeGameState("Drawing");
    await this.updateTicketsInfo();

    const winner = await this._lottery.pickTheWinner(
      shouldForceRecalculateWinner,
      shouldPayToWinner
    );
    const winnerEvt = await winner.wait();

    console.clear();
    console.log("winnerEvt ", winnerEvt);

    if (winnerEvt.events[0].args.stat)
      saveNewWinner(winnerEvt.events[0].args.winner);
  };

  onBuyTicket = async (ticketLuckyNumber, ticketCount, aliasName) => {
    console.log("ticketLuckyNumber: ", ticketLuckyNumber);
    console.log("ticketCount: ", ticketCount);
    console.log("aliasName: ", aliasName);
    let theSalt = parseInt(Math.random() * 1000000000).toString();

    let ticketBuyDate = getNow();
    let ticketHash =
      ticketLuckyNumber.toString() +
      ";" +
      ticketBuyDate +
      ";" +
      aliasName +
      ";" +
      theSalt;
    ticketHash = doSha256(ticketHash);

    if (ticketCount > 1) {
      // create enough more tickets and send all them in one transaction
    }

    const tx = await this._lottery.buyATicket(
      ticketHash,
      ticketBuyDate,
      ticketCount,
      aliasName,
      {
        value: (this.state.ticketPriceInWei * ticketCount).toString(),
      }
    );
    console.log("tx ", tx);
    const receipt = await tx.wait();
    if (
      receipt.events.length !== 1 ||
      receipt.events[0].event !== "LogTicketSold" ||
      receipt.events[0].args.stat !== true
    ) {
      // failed in fund transfer from buyer to contract
      console.log("receipt ", receipt);
      return false;
    }

    // tmp solution, Save buyer necessary info in local storage (later bring it to backend)
    saveNewTicket({
      ticketHash,
      ticketBuyDate,
      ticketLuckyNumber,
      ticketCount,
      aliasName,
      theSalt,
    });
    this.updateTicketsInfo();

    return true;
  };

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    const networkID = window.ethereum.networkVersion;
    if (
      networkID === HARDHAT_NETWORK_ID ||
      networkID === ROPSTEN_TEST_NETWORK_ID
    ) {
      return true;
    }

    this.setState({
      networkError: "Please connect Metamask to Localhost:8545",
    });

    return false;
  }

  componentDidMount() {
    // const script = document.createElement("script");
    // script.src = "../js/JogDial.js-master/jogDial.min.js";
    // script.async = true;
    // document.body.appendChild(script);
  }
}
