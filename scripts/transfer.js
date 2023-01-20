// This script transfers the NFTs to the 'Manage'
// Smart Contract
const { ethers, network, hre } = require("hardhat");
const axios = require("axios");

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

require("dotenv").config();

const { manage } = require("../address.js");

const ALCHEMY_URL = process.env.ALCHEMY_URL;

const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
const {
  abi: INonFungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
// User holding the positions:
const WHALE = "0xFf04026530372eE46aA122dacB8093218051f3cD";

const id = 393909;

async function main() {
  // const result = await axios.post(SUBGRAPH_URL, { query: QUERY });

  // const positions = result.data.data.positions;

  // console.log("Positions: ", positions);

  const nftManagerContract = await ethers.getContractAt(
    "INonfungiblePositionManager",
    positionManagerAddress
  );

  const manageContract = await ethers.getContractAt("Manage", manage);

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [WHALE],
  });

  const whale = await ethers.getSigner(WHALE);

  const [tester1] = await ethers.getSigners();

  await tester1.sendTransaction({
    to: whale.address,
    value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
  });

  // We transfer the NFT to the
  // deployed 'Manage' Contract here :

  await nftManagerContract.connect(whale).approve(manageContract.address, id);

  const tx = await manageContract.connect(whale).enter(id);

  console.log("Transaction : ", tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
