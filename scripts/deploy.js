// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  // console.log("deployer", deployer);

  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const balanceBeforeDeploy = await deployer.getBalance();
  console.log("Account balance Before deploy:", ethers.utils.formatEther(balanceBeforeDeploy.toString()));
  
  let contractsAddresses = {};

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  contractsAddresses["Token"] = token.address;
  console.log("Token address:", token.address);
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendContracts("Token");

  // deploy Lottery contract
  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.deployed();
  console.log("lottery address:", lottery.address);
  contractsAddresses["Lottery"] = lottery.address;

  
  const balanceAfterDeploy = await deployer.getBalance();
  console.log("Account balance after deploy:", ethers.utils.formatEther(balanceAfterDeploy.toString()));
  console.log("Deploy cost:", ethers.utils.formatEther((balanceBeforeDeploy-balanceAfterDeploy).toString()));
  
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendContracts("Lottery");

  // save contracts addresses
  saveFrontendContractAddresses(contractsAddresses);
}

function saveFrontendContractAddresses(contractsAddresses) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(contractsAddresses, undefined, 2)
  );
}

function saveFrontendContracts(contractName) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const ContractArtifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    contractsDir + `/${contractName}.json`,
    JSON.stringify(ContractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
