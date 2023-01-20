require("dotenv").config();
const { ethers } = require("hardhat");
const ALCHEMY_URL = process.env.ALCHEMY_URL;
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
const axios = require("axios");
const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const ManageABI = require("../artifacts/contracts/Manage.sol/Manage.json");

const manage = require("../address");

const id = 393909;
// User who already holds a position on mainnet
const USER = "0xFf04026530372eE46aA122dacB8093218051f3cD";

POSITION_QUERY = `{
    position(id: ${id}) {
      id
      collectedFeesToken0
      collectedFeesToken1
      tickLower { tickIdx }
      tickUpper { tickIdx }
      liquidity
      token0 {
        id
        symbol
        decimals
      }
      token1
      {
        id
        symbol
        decimals
      }
    }
  }`;

POOL_QUERY = `{
    pool(id: "0x3416cf6c708da44db2624d63ea0aaef7113527c6") {
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

const tickToPice = (tick) => {
  return 1.0001 ** tick;
};

//

const calculateIL = async () => {
  const positionQuery = await axios.post(SUBGRAPH_URL, {
    query: POSITION_QUERY,
  });

  const position = positionQuery.data.data.position;

  console.log("Position details: ", position);

  const poolResult = await axios.post(SUBGRAPH_URL, { query: POOL_QUERY });

  const pool = poolResult.data.data.pool;
  console.log("Pool Data: ", pool);

  let liquidity = Number(position["liquidity"]);
  let tick_lower = Number(position["tickLower"]["tickIdx"]);
  let tick_upper = Number(position["tickUpper"]["tickIdx"]);
  let token0 = position["token0"]["symbol"];
  let token1 = position["token1"]["symbol"];
  let decimals0 = Number(position["token0"]["decimals"]);
  let decimals1 = Number(position["token1"]["decimals"]);

  let current_tick = Number(pool["tick"]);
  let current_sqrt_price = Number(pool["sqrtPrice"]) / 2 ** 96;

  let current_price = tickToPice(current_tick);

  console.log(
    `Current Price = ${Number(
      current_price
    )} , ${token1} for ${token0} at tick ${current_tick}`
  );

  let sa = tickToPice(tick_lower / 2);
  let sb = tickToPice(tick_upper / 2);

  console.log("Upper tick:", tick_upper);
  console.log("current tick :", current_tick);

  let amount0, amount1;

  if (tick_upper <= current_tick) {
    amount0 = 0;
    amount1 = liquidity * (sb - sa);
  } else if (tick_lower < current_tick < tick_upper) {
    amount0 =
      (liquidity * (sb - current_sqrt_price)) / (current_sqrt_price * sb);
    amount1 = liquidity * (current_sqrt_price - sa);
  } else {
    amount0 = (liquidity * (sb - sa)) / (sa * sb);
    amount1 = 0;
  }

  let adjusted_amount0 = Number(amount0 / 10 ** decimals0);
  let adjusted_amount1 = Number(amount1 / 10 ** decimals1);

  console.log("Adjusted amount : ", adjusted_amount0);

  let ratio;
  if (adjusted_amount0 > adjusted_amount1) {
    ratio = adjusted_amount1 / adjusted_amount0;
  } else if (adjusted_amount0 < adjusted_amount1) {
    ratio = adjusted_amount0 / adjusted_amount1;
  }

  return ratio;
};

const exit = async () => {
  try {
    const manageContract = new ethers.Contract(
      manage.manage,
      ManageABI.abi,
      provider
    );

    accounts = await ethers.getSigners();
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USER],
    });

    const user = await ethers.getSigner(USER);

    await accounts[0].sendTransaction({
      to: user.address,
      value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
    });

    // console.log("Manage Address: ", manage.manage);

    const tx = await manageContract.connect(user).decreaseFullLiquidity(id);

    console.log(tx);
    console.log("Exited successfully");
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  var bot = setInterval(() => {
    const res = calculateIL();
    console.log("Looking for loss...");
    if (res >= 0.3) {
      exit();
      clearInterval(bot);
    }
  }, 3000);
};
//
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
//
