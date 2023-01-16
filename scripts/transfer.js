// This script queries all the active positions in a pool
// and transfers all the NFTs to the 'Interact'
// Smart Contract
const { ethers, network, hre } = require("hardhat");
const axios = require("axios");

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

require("dotenv").config();

const { interact } = require("../address.js");

const ALCHEMY_URL = process.env.ALCHEMY_URL;

const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
const {
  abi: INonFungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
// User holding the positions:
const WHALE = "0xFf04026530372eE46aA122dacB8093218051f3cD";

QUERY = `{
    positions(where : {
        owner: "0xFf04026530372eE46aA122dacB8093218051f3cD",
        pool : "0x3416cf6c708da44db2624d63ea0aaef7113527c6"
    }) {
        id
        owner
        tickLower
        tickUpper
        token0 {
          id
          symbol
        }
        token1
        {
          id
          symbol
        }
        depositedToken0
        depositedToken1
    }
}`;

async function main() {
  const result = await axios.post(SUBGRAPH_URL, { query: QUERY });

  const positions = result.data.data.positions;

  console.log("Positions: ", positions);

  const nftManagerContract = await ethers.getContractAt(
    "INonfungiblePositionManager",
    positionManagerAddress
  );

  const interactContract = await ethers.getContractAt("Interact", interact);

  // Impersonating the holder to work with the
  // forked mainnet and sending test funds
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

  // We transfer the NFT of the first position to the
  // deployed 'Interact' Contract here :

  const tx = await nftManagerContract
    .connect(whale)
    ["safeTransferFrom(address,address,uint256)"](
      whale.address,
      interact,
      positions[0].id
    );

  console.log("Transaction : ", tx);

  const tx2 = await interactContract
    .connect(whale)
    .retrieveNFT(positions[0].id);

  console.log("Second tx : ", tx2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
