const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const nftManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

  const Manage = await hre.ethers.getContractFactory("Manage");
  const manage = await Manage.deploy(nftManagerAddress);

  await manage.deployed();

  console.log(`Manage contract deployed to ${manage.address}`);

  const SwapCoin = await hre.ethers.getContractFactory("SwapCoin");
  const swapcoin = await SwapCoin.deploy(swapRouterAddress);

  await swapcoin.deployed();

  console.log(`SwapCoin contract deployed to ${swapcoin.address}`);

  fs.writeFileSync(
    "./address.js",
    `
     const swapCoin = "${swapcoin.address}"
     const manage = "${manage.address}"
     module.exports = {swapCoin, manage};`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
