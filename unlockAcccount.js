const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const USDC_WHALE = "0xFf04026530372eE46aA122dacB8093218051f3cD";

describe("Test unlock accounts", () => {
  let accounts;
  let usdc;
  let whale;

  before(async () => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    whale = await ethers.getSigner(USDC_WHALE);
    usdc = await ethers.getContractAt("IERC20", USDC);

    accounts = await ethers.getSigners();
  });

  it("unlock account", async () => {
    const amount = 10 ** 3;

    let whaleBal = await usdc.balanceOf(USDC_WHALE);

    console.log(
      "USDC balance of whale : ",
      ethers.utils.formatUnits(whaleBal, 6)
    );
    expect(await usdc.balanceOf(USDC_WHALE)).to.gte(amount);

    await usdc.connect(whale).transfer(accounts[0].address, amount);

    console.log(
      "USDC balance of account",
      await usdc.balanceOf(accounts[0].address)
    );
  });
});
