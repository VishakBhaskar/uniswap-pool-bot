const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const {
  abi: INonFungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

// const { manage } = require("../address.js");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDC_WHALE = "0x203520F4ec42Ea39b03F62B20e20Cf17DB5fdfA7";
const USDT_WHALE = "0x187E3534f461d7C59a7d6899a983A5305b48f93F";

const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const TEN_K = ethers.utils.parseUnits("10000", 6);
const ONE_K = ethers.utils.parseUnits("1000", 6);

describe("Mints and transfers the NFT", () => {
  let accounts;
  let usdc;
  let usdt;
  let usdcwhale;
  let usdtwhale;
  let user;
  let user2;
  let manageContract;
  let nftManager;
  let id;
  // const tokenId = 406004; // TokenId of a position

  before(async () => {
    usdc = await ethers.getContractAt("IERC20", USDC);
    usdt = await ethers.getContractAt("IERC20", USDT);

    const Manage = await hre.ethers.getContractFactory("Manage");
    const manage = await Manage.deploy(positionManagerAddress);

    await manage.deployed();

    manageContract = manage;

    nftManager = await ethers.getContractAt(
      "INonfungiblePositionManager",
      positionManagerAddress
    );

    accounts = await ethers.getSigners();
    user = accounts[0];
    user2 = accounts[1];

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

    await accounts[0].sendTransaction({
      to: manageContract.address,
      value: ethers.utils.parseEther("50.0"), // Sends exactly 50.0 ether
    });

    await usdc.connect(usdcwhale).transfer(user.address, TEN_K);
    await usdt.connect(usdtwhale).transfer(user.address, TEN_K);

    await usdc.connect(user).approve(manageContract.address, 100000);
    await usdt.connect(user).approve(manageContract.address, 100000);

    await manageContract.connect(user).mintNewPosition();
    id = await manageContract.getLatestId();

    console.log("Token Id : ", id);
  });

  it("Exit the position", async () => {
    console.log("Initial User USDC Bal : ", await usdc.balanceOf(user.address));
    console.log("initial User USDT Bal : ", await usdt.balanceOf(user.address));

    // const posData = await nftManager.connect(user).positions(id);

    // console.log("Position Data : ", posData);

    await manageContract.connect(user).decreaseFullLiquidity(id);

    console.log("Final User USDC Bal : ", await usdc.balanceOf(user.address));
    console.log("Final User USDT Bal : ", await usdt.balanceOf(user.address));
  });

  //   it("Retrieve NFT, send to other user, exit position", async () => {
  //     await manageContract.connect(user).retrieveNFT(id);

  //     // await nftManager.connect(user).approve(user2.address, id);

  //     // const initOwner = await nftManager.ownerOf(id);
  //     // console.log("Initial owner : ", initOwner);
  //     // console.log("User1  : ", user.address);

  //     await nftManager
  //       .connect(user)
  //       ["safeTransferFrom(address,address,uint256)"](
  //         user.address,
  //         user2.address,
  //         id
  //       );

  //     await nftManager.connect(user2).approve(manageContract.address, id);

  //     await manageContract.connect(user2).enter(id);

  //     // const finalOwner = await nftManager.ownerOf(id);
  //     // console.log("Final owner : ", finalOwner);
  //     // console.log("User2 : ", user2.address);

  //     // await nftManager
  //     //   .connect(user2)
  //     //   ["safeTransferFrom(address,address,uint256)"](
  //     //     user2.address,
  //     //     manageContract.address,
  //     //     id
  //     //   );

  //     // await nftManager.connect(user2).approve(user2.address, id);

  //     console.log(
  //       "Initial User2 USDC Bal : ",
  //       await usdc.balanceOf(user2.address)
  //     );
  //     console.log(
  //       "initial User2 USDT Bal : ",
  //       await usdt.balanceOf(user2.address)
  //     );

  //     // const posData = await nftManager.connect(user).positions(id);

  //     // console.log("Position Data : ", posData);
  //     // console.log("User2 : ", user2);

  //     // const posData = await nftManager.connect(user).positions(id);
  //     // //
  //     // console.log("Position Data : ", posData);
  //     await manageContract.connect(user2).decreaseFullLiquidity(id);

  //     console.log("Final User2 USDC Bal : ", await usdc.balanceOf(user2.address));
  //     console.log("Final User2 USDT Bal : ", await usdt.balanceOf(user2.address));
  //   });
});
