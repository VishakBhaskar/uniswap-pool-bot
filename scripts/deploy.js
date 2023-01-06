// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");
  const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const nftManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

  const Interact = await hre.ethers.getContractFactory("Interact");
  const interact = await Interact.deploy(nftManagerAddress, swapRouterAddress);

  await interact.deployed();

  console.log(`Interact contract deployed to ${interact.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
