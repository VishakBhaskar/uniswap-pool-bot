// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;
pragma abicoder v2;

interface ISwapCoin {
    function swapExactInputSingle(
        uint256 amountIn
    ) external returns (uint256 amountOut);
}
