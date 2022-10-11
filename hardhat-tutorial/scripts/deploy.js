const { ethers } = require("hardhat");

async function main() {
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  const whitelistDeployed = await whitelistContract.deploy(10);

  await whitelistDeployed.deployed();

  console.log("Whitelist deployed to:", whitelistDeployed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
