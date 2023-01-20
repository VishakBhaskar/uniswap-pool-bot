const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const {
  abi: INonFungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDC_WHALE = "0x203520F4ec42Ea39b03F62B20e20Cf17DB5fdfA7";
const USDT_WHALE = "0x187E3534f461d7C59a7d6899a983A5305b48f93F";

const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

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
  let swapcoin;
  // const tokenId = 406004; // TokenId of a position

  before(async () => {
    usdc = await ethers.getContractAt("IERC20", USDC);
    usdt = await ethers.getContractAt("IERC20", USDT);

    const SwapCoin = await hre.ethers.getContractFactory("SwapCoin");
    const _swapcoin = await SwapCoin.deploy(swapRouterAddress);

    await _swapcoin.deployed();

    swapcoin = _swapcoin;

    const Manage = await hre.ethers.getContractFactory("Manage");
    const manage = await Manage.deploy(
      positionManagerAddress,
      swapcoin.address
    );

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

    await manageContract.connect(user).decreaseFullLiquidity(id);

    console.log("Final User USDC Bal : ", await usdc.balanceOf(user.address));
    console.log("Final User USDT Bal : ", await usdt.balanceOf(user.address));
  });
});
