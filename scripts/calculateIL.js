const axios = require("axios");
const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
require("dotenv").config();

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

  // POOL PARAMETERS
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
    // ONLY TOKEN-1 LOCKED
    amount0 = 0;
    amount1 = liquidity * (sb - sa);
  } else if (tick_lower < current_tick < tick_upper) {
    // Both tokens present
    amount0 =
      (liquidity * (sb - current_sqrt_price)) / (current_sqrt_price * sb);
    amount1 = liquidity * (current_sqrt_price - sa);
  } else {
    // ONLY TOKEN-0 LOCKED
    amount0 = (liquidity * (sb - sa)) / (sa * sb);
    amount1 = 0;
  }

  // Printing Info about position
  // ----------------------------

  let adjusted_amount0 = Number(amount0 / 10 ** decimals0);
  let adjusted_amount1 = Number(amount1 / 10 ** decimals1);

  console.log("Adjusted amount : ", adjusted_amount0);
  // Calculating the impermanent loss
  // --------------------------------

  let ratio;
  if (adjusted_amount0 > adjusted_amount1) {
    ratio = adjusted_amount1 / adjusted_amount0;
  } else if (adjusted_amount0 < adjusted_amount1) {
    ratio = adjusted_amount0 / adjusted_amount1;
  }

  return ratio;
};

calculateIL().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { calculateIL };
