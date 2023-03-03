// The Licensed Work is (c) 2022 Sygma
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.11;

import "../../utils/AccessControl.sol";
import "../../interfaces/IHandler.sol";
import "../../interfaces/IDepositContract.sol";

/**
    @title Makes deposits to Goerli deposit contract.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with the Bridge contract and Generic handler.
 */
contract DepositAdapterTarget is AccessControl {
    address public constant _depositContract = 0xff50ed3d0ec03aC01D4C79aAd74928BFF48a7b2b;

    address public immutable _handlerAddress;
    address public immutable _bridgeAddress;
    address public _depositAdapterOrigin;

    event DepositAdapterOriginChanged(
        address newDepositAdapter
    );

    /**
        @notice This event is emitted during withdrawal.
        @param recipient Address that receives the money.
        @param amount Amount that is distributed.
     */
    event Withdrawal(
        address recipient,
        uint256 amount
    );

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "sender doesn't have admin role");
        _;
    }

    modifier onlyHandler() {
        _onlyHandler();
        _;
    }

    function _onlyHandler() private view {
        require(msg.sender == _handlerAddress, "sender must be handler contract");
    }

    /**
        @param bridgeAddress Contract address of previously deployed Bridge.
        @param handlerAddress Contract address of previously deployed generic handler.
     */
    constructor(address bridgeAddress, address handlerAddress) public {
        _bridgeAddress = bridgeAddress;
        _handlerAddress = handlerAddress;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @notice Sets new address of the deposit adapter on the target chain (used for checks on source chain).
        @notice Only callable by admin.
        @param depositAdapterOrigin Value {_depositAdapterOrigin} will be updated to.
     */
    function changeOriginAdapter(address depositAdapterOrigin) external onlyAdmin {
        require(_depositAdapterOrigin != depositAdapterOrigin, "New deposit adapter address is equal to old");
        _depositAdapterOrigin = depositAdapterOrigin;
        emit DepositAdapterOriginChanged(depositAdapterOrigin);
    }

    fallback(bytes calldata depositData) external onlyHandler {
        //  maxFee:                             uint256  bytes  0                                                             -  32
        //   len(executeFuncSignature):          uint16   bytes  32                                                            -  34
        //   executeFuncSignature:               bytes    bytes  34                                                            -  34 + len(executeFuncSignature)
        //   len(executeContractAddress):        uint8    bytes  34 + len(executeFuncSignature)                                -  35 + len(executeFuncSignature)
        //   executeContractAddress              bytes    bytes  35 + len(executeFuncSignature)                                -  35 + len(executeFuncSignature) + len(executeContractAddress)
        //   len(executionDataDepositor):        uint8    bytes  35 + len(executeFuncSignature) + len(executeContractAddress)  -  36 + len(executeFuncSignature) + len(executeContractAddress)
        //   executionDataDepositorWithData:     bytes    bytes  36 + len(executeFuncSignature) + len(executeContractAddress)  -  END
        // TODO: check that depositor is origin adapter

        // TODO: check that withdrawal address is this
        // TODO: deposit to depositContract
    }

    /**
        @notice Receives Eth.
     */
    receive() external payable {
    }

    /**
        @notice Transfers eth in the contract to the specified addresses. The parameters addrs and amounts are mapped 1-1.
        This means that the address at index 0 for addrs will receive the amount (in WEI) from amounts at index 0.
        @param addrs Array of addresses to transfer {amounts} to.
        @param amounts Array of amounts to transfer to {addrs}.
     */
    function withdraw(address payable[] calldata addrs, uint[] calldata amounts) external onlyAdmin {
        require(addrs.length == amounts.length, "addrs[], amounts[]: diff length");
        for (uint256 i = 0; i < addrs.length; i++) {
            (bool success,) = addrs[i].call{value: amounts[i]}("");
            require(success, "Withdrawal failed");
            emit Withdrawal(addrs[i], amounts[i]);
        }
    }
}
