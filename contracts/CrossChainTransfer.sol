```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./DWETH.sol";
import "./ETHBurn.sol";

contract CrossChainTransfer {
    DWETH public dweth;
    ETHBurn public ethBurn;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);
    event Mint(address indexed minter, uint256 value);

    constructor(DWETH _dweth, ETHBurn _ethBurn) {
        dweth = _dweth;
        ethBurn = _ethBurn;
    }

    function burnAndMint(uint256 _value) public {
        require(ethBurn.burn(msg.sender, _value), "ETH burn failed");
        require(dweth.mint(msg.sender, _value), "DWETH mint failed");

        emit Burn(msg.sender, _value);
        emit Mint(msg.sender, _value);
        emit Transfer(address(ethBurn), msg.sender, _value);
    }

    function mintAndBurn(uint256 _value) public {
        require(dweth.burn(msg.sender, _value), "DWETH burn failed");
        require(ethBurn.mint(msg.sender, _value), "ETH mint failed");

        emit Burn(msg.sender, _value);
        emit Mint(msg.sender, _value);
        emit Transfer(address(dweth), msg.sender, _value);
    }
}
```