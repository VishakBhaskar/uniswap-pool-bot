# Uniswap bot to prevent impermanent loss

This project monitors a position in a uniswap pool, automatically exits the position if there is an impermanent loss of more than 30%, converts the tokens of the position into USDC (USDC-USDT pair here so all the USDT is converted into USDC) and is sent back to the user's wallet. 

To run the project:

```shell
npm install
npx hardhat
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<key>
npx hardhat test test/mint.js
npx hardhat test test/transfer.js
npx hardhat test test/exit.js
npx hardhat run scripts/deploy.js
npx hardhat run scripts/transfer.js
npx hardhat run scripts/exit.js
```
