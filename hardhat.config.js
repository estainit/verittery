require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

// task action function receives the Hardhat Runtime Environment as second argument
// run "npx hardhat accounts" in commandline to get accounts list
task("accounts", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
  // console.log(await web3.utils.toWei("1", "ether"));
});

task("accountsB", "Prints accounts", async (_, { web3 }) => {
  let accounts = await web3.eth.getAccounts();
  for (let inx in accounts) {
    let bal = await web3.eth.getBalance(accounts[inx]);
    let balH = web3.utils.fromWei(bal, "ether");
    console.log(`${inx}. ${accounts[inx]} ${balH} ETH(${bal})`);
  }
});

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
// HTTP:         https://eth-ropsten.alchemyapi.io/v2/hgWDQQsicvBZuNVBU8LYmwc8xSFeGXP8
// WEBSOCKETS:   wss://eth-ropsten.alchemyapi.io/v2/hgWDQQsicvBZuNVBU8LYmwc8xSFeGXP8
const ALCHEMY_API_KEY = "hgWDQQsicvBZuNVBU8LYmwc8xSFeGXP8";

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = "3adcd63a88ce96920808bf69d3a916d43999151fb0696ae5129352cb9e013491";

module.exports = {
  solidity: "0.8.0",

  mining: {
    auto: false,
    interval: 5000,
  },

  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 5000,
      },
      chainId: 31337,
    },

    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`],
    },
  },

  //   localhost: {
  //     url: "http://127.0.0.1:8545",
  //     chainId: 31337, // 1337, or default was 31337
  //   },
  //   ganache: {
  //     url: "http://127.0.0.1:7545",
  //     chainId: 1341,
  //   },
  // },
};
