```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DWETH is ERC20 {
    address public admin;

    constructor() ERC20("Decentralized Wrapped ETH", "DWETH") {
        admin = msg.sender;
    }

    function mint(address to, uint amount) external {
        require(msg.sender == admin, "only admin");
        _mint(to, amount);
    }

    function burn(address from, uint amount) external {
        require(msg.sender == admin, "only admin");
        _burn(from, amount);
    }
}
```