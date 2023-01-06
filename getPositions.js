const axios = require("axios");
const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
require("dotenv").config();
const { ethers } = require("ethers");
const ALCHEMY_URL = process.env.ALCHEMY_URL;
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
const {
  abi: INonFungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

QUERY = `{
    positions(where : {
        owner: "0xFf04026530372eE46aA122dacB8093218051f3cD",
        pool : "0x3416cf6c708da44db2624d63ea0aaef7113527c6"
    }) {
        id
        owner
        tickLower
        tickUpper
        depositedToken0
        depositedToken1
    }
}`;

// 0x58294302c4097deb040fc9dd0020042ee546d0c5

POSITION_QUERY = `{
  position(id: 393909) {
    id
    collectedFeesToken0
    collectedFeesToken1
    tickLower { tickIdx }
    tickUpper { tickIdx }
    liquidity
    token0 {
      id
      symbol
    }
    token1
    {
      id
      symbol
    }
  }
}`;

POOL_QUERY = `{
  pool(id: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8") {
    tick
    token0 {
      symbol
      id
      decimals
    }
    token1 {
      symbol
      id
      decimals
    }
    feeTier
    sqrtPrice
    liquidity
  }
}`;

async function main() {
  const result = await axios.post(SUBGRAPH_URL, { query: QUERY });

  const positions = result.data.data.positions;

  console.log("Positions: ", positions);

  const positionQuery = await axios.post(SUBGRAPH_URL, {
    query: POSITION_QUERY,
  });

  const positionResult = positionQuery.data.data.position;

  console.log("Position details: ", positionResult);

  const poolResult = await axios.post(SUBGRAPH_URL, { query: POOL_QUERY });

  const pool = poolResult.data.data.pool;
  console.log("Pool Data: ", pool);

  const NonfungiblePositionManagerContract = new ethers.Contract(
    positionManagerAddress,
    INonFungiblePositionManagerABI,
    provider
  );

  positions.map((p) => {
    NonfungiblePositionManagerContract.positions(p.id).then((res) =>
      console.log("result  : ", res)
    );
  });

  const posData = await NonfungiblePositionManagerContract.positions(
    positions[0].id
  );
  console.log("Upper Tick : ", posData[6]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
