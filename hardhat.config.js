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
