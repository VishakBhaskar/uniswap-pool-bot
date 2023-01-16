const { expect } = require("chai");
const { ethers, network } = require("hardhat");

// const { manage } = require("../address.js");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDC_WHALE = "0x203520F4ec42Ea39b03F62B20e20Cf17DB5fdfA7";
const USDT_WHALE = "0x187E3534f461d7C59a7d6899a983A5305b48f93F";

const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const TEN_K = ethers.utils.parseUnits("10000", 6);
const ONE_K = ethers.utils.parseUnits("1000", 6);

describe("Test the automation", () => {
  let accounts;
  let usdc;
  let usdt;
  let usdcwhale;
  let usdtwhale;
  let user;
  let manageContract;
  // const tokenId = 406004; // TokenId of a position

  before(async () => {
    usdc = await ethers.getContractAt("IERC20", USDC);
    usdt = await ethers.getContractAt("IERC20", USDT);

    const Manage = await hre.ethers.getContractFactory("Manage");
    const manage = await Manage.deploy(positionManagerAddress);

    await manage.deployed();

    manageContract = manage;

    accounts = await ethers.getSigners();
    user = accounts[0];

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDT_WHALE],
    });

    usdtwhale = await ethers.getSigner(USDT_WHALE);

    await accounts[0].sendTransaction({
      to: usdtwhale.address,
      value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
    });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    usdcwhale = await ethers.getSigner(USDC_WHALE);

    await accounts[0].sendTransaction({
      to: usdcwhale.address,
      value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
    });

    await usdc.connect(usdcwhale).transfer(user.address, TEN_K);
    await usdt.connect(usdtwhale).transfer(user.address, TEN_K);
  });

  it("Mint a position", async () => {
    await usdc.connect(user).approve(manageContract.address, 100000);
    await usdt.connect(user).approve(manageContract.address, 100000);

    console.log("Initial User USDC Bal : ", await usdc.balanceOf(user.address));
    console.log("initial User USDT Bal : ", await usdt.balanceOf(user.address));

    await manageContract.connect(user).mintNewPosition();
    const id = await manageContract.getLatestId();

    console.log("Token Id : ", id);

    console.log("Final User USDC Bal : ", await usdc.balanceOf(user.address));
    console.log("Final User USDT Bal : ", await usdt.balanceOf(user.address));
  });

  //   it("Sends token to Interact Contract", async () => {
  //     const nftManagerContract = await ethers.getContractAt(
  //       "INonfungiblePositionManager",
  //       positionManagerAddress
  //     );

  //     // const interactContract = await ethers.getContractAt("Interact", interact);

  //     await expect(
  //       nftManagerContract
  //         .connect(whale)
  //         ["safeTransferFrom(address,address,uint256)"](
  //           whale.address,
  //           interact,
  //           tokenId
  //         )
  //     ).not.to.be.reverted;
  //   });

  // it("Exits a position after sending token", async () => {
  //   const nftManagerContract = await ethers.getContractAt(
  //     "INonfungiblePositionManager",
  //     positionManagerAddress
  //   );

  //   const interactContract = await ethers.getContractAt("Interact", interact);

  // await expect(
  //   nftManagerContract
  //     .connect(whale)
  //     ["safeTransferFrom(address,address,uint256)"](
  //       whale.address,
  //       interact,
  //       tokenId
  //     )
  // ).not.to.be.reverted;
  //   await nftManagerContract
  //     .connect(whale)
  //     ["safeTransferFrom(address,address,uint256)"](
  //       whale.address,
  //       interact,
  //       tokenId
  //     );

  //   let whaleBal = await usdc.balanceOf(WHALE);

  //   console.log("Initial USDC Balance : ", whaleBal);

  //   await interactContract.connect(whale).decreaseLiquidityInHalf(tokenId);

  //   let newWhaleBal = await usdc.balanceOf(WHALE);
  //   console.log("Final USDC Balance : ", newWhaleBal);
  // });

  //   it("unlock account", async () => {
  //     const amount = 10 ** 3;

  //     let whaleBal = await usdc.balanceOf(USDC_WHALE);

  //     console.log(
  //       "USDC balance of whale : ",
  //       ethers.utils.formatUnits(whaleBal, 6)
  //     );
  //     expect(await usdc.balanceOf(USDC_WHALE)).to.gte(amount);

  //     await usdc.connect(whale).transfer(accounts[0].address, amount);

  //     console.log(
  //       "USDC balance of account",
  //       await usdc.balanceOf(accounts[0].address)
  //     );
  //   });
});
