// The Licensed Work is (c) 2022 Sygma
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.11;

import "../../utils/AccessControl.sol";
import "../../interfaces/IBridge.sol";
import "../../interfaces/IDepositContract.sol";

/**
    @title Receives messages for making deposits to Goerli deposit contract.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with the Bridge contract and Permissionless Generic handler.
 */
contract DepositAdapterOrigin is AccessControl {
    address public immutable _bridgeAddress;
    address public _targetDepositAdapter;
    uint256 public _depositFee;

    struct WithdrawalCredentials {
        uint8 prefix;
        bytes11 zero;
        address withdrawalAddress;
    }

    event FeeChanged(
        uint256 newFee
    );

    event DepositAdapterTargetChanged(
        address newDepositAdapter
    );

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "sender doesn't have admin role");
        _;
    }

    /**
        @param bridgeAddress Contract address of previously deployed Bridge.
        @param targetDepositAdapter Contract address of previously deployed target deposit adapter.
     */
    constructor(address bridgeAddress, address targetDepositAdapter) public {
        _bridgeAddress = bridgeAddress;
        _targetDepositAdapter = _targetDepositAdapter;
        _depositFee = 3.2 ether;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @notice Sets new value of the fee.
        @notice Only callable by admin.
        @param newFee Value {_fee} will be updated to.
     */
    function changeFee(uint256 newFee) external onlyAdmin {
        require(_depositFee != newFee, "Current fee is equal to new fee");
        _depositFee = newFee;
        emit FeeChanged(newFee);
    }

    /**
        @notice Sets new address of the deposit adapter on the target chain (used for checks on source chain).
        @notice Only callable by admin.
        @param targetDepositAdapter Value {_targetDepositAdapter} will be updated to.
     */
    function changeTargetAdapter(address targetDepositAdapter) external onlyAdmin {
        require(_targetDepositAdapter != targetDepositAdapter, "New deposit adapter address is equal to old");
        _targetDepositAdapter = targetDepositAdapter;
        emit DepositAdapterTargetChanged(targetDepositAdapter);
    }

    function deposit(
        uint8 destinationDomainID,
        bytes32 resourceID,
        bytes calldata pubkey,
        bytes calldata withdrawal_credentials,
        bytes calldata signature,
        bytes32 deposit_data_root
    ) external payable {
        // Collect fee
        require(msg.value >= _depositFee, "Incorrect fee supplied");
        // Check input data
        require(pubkey.length == 48, "DepositContract: invalid pubkey length");
        require(withdrawal_credentials.length == 32, "DepositContract: invalid withdrawal_credentials length");
        require(signature.length == 96, "DepositContract: invalid signature length");
        // Verify withdrawal_credentials
        WithdrawalCredentials memory credentials = abi.decode(withdrawal_credentials, (WithdrawalCredentials));
        uint8 ETH1_ADDRESS_WITHDRAWAL_PREFIX = 1;
        require(credentials.prefix == ETH1_ADDRESS_WITHDRAWAL_PREFIX, "Wrong withdrawal_credentials");
        require(keccak256(abi.encode(credentials.zero)) == keccak256(bytes('0x0000000000000000000000')), "Wrong withdrawal_credentials");
        require(credentials.withdrawalAddress == _targetDepositAdapter, "Wrong withdrawal address");
        // TODO: deposit to bridge
        
    //   maxFee:                       uint256  bytes  0                                                                                           -  32
    //       len(executeFuncSignature):    uint16   bytes  32                                                                                          -  34
    //       executeFuncSignature:         bytes    bytes  34                                                                                          -  34 + len(executeFuncSignature)
    //       len(executeContractAddress):  uint8    bytes  34 + len(executeFuncSignature)                                                              -  35 + len(executeFuncSignature)
    //       executeContractAddress        bytes    bytes  35 + len(executeFuncSignature)                                                              -  35 + len(executeFuncSignature) + len(executeContractAddress)
    //       len(executionDataDepositor):  uint8    bytes  35 + len(executeFuncSignature) + len(executeContractAddress)                                -  36 + len(executeFuncSignature) + len(executeContractAddress)
    //       executionDataDepositor:       bytes    bytes  36 + len(executeFuncSignature) + len(executeContractAddress)                                -  36 + len(executeFuncSignature) + len(executeContractAddress) + len(executionDataDepositor)
    //       executionData:                bytes    bytes  36 + len(executeFuncSignature) + len(executeContractAddress) + len(executionDataDepositor)  -  END
        address executeContractAddress = _targetDepositAdapter;
        bytes memory executionData = abi.encodePacked(pubkey, withdrawal_credentials, signature, deposit_data_root);
        bytes memory depositData = abi.encodePacked(uint256(0), uint16(0), bytes4(0), uint8(20), executeContractAddress, uint8(20), address(this), executionData);
        IBridge(_bridgeAddress).deposit(destinationDomainID, resourceID, depositData, "0x");
    }
}
