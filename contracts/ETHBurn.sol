```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ETHBurn is ERC20 {
    address public admin;

    constructor() ERC20("ETHBurn", "EBN") {
        admin = msg.sender;
    }

    function burn(uint256 amount) external {
        require(msg.sender == admin, "only admin");
        _burn(msg.sender, amount);
    }
}
```