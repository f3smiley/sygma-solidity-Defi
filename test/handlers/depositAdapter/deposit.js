/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const TruffleAssert = require("truffle-assertions");
const Ethers = require("ethers");

const Helpers = require("../../helpers");

const DepositAdapterOriginContract = artifacts.require("DepositAdapterOrigin");
const DepositAdapterTargetContract = artifacts.require("DepositAdapterTarget");
const IDepositContract = artifacts.require("IDepositContract");
const PermissionlessGenericHandlerContract = artifacts.require(
  "PermissionlessGenericHandler"
);
const BasicFeeHandlerContract = artifacts.require("BasicFeeHandler");
const TestTargetContract = artifacts.require("TestTarget");

let BridgeInstance;
let PermissionlessGenericHandlerInstance;
let BasicFeeHandlerInstance;

contract("DepositAdapter", async (accounts) => {
  const originDomainID = 1;
  const destinationDomainID = 2;
  const relayer1Address = accounts[2];

  beforeEach(async () => {
        BridgeInstance = await Helpers.deployBridge(originDomainID, accounts[0]);
        PermissionlessGenericHandlerInstance =
        await PermissionlessGenericHandlerContract.new(BridgeInstance.address);
  });

  it("Deploy and configure depositAdapterOrigin and depositAdapterTarget", async () => {
    const testTargetInstance = await TestTargetContract.new();

    const depositAdapterOriginInstance 
      = await DepositAdapterOriginContract.new(BridgeInstance.address);
    assert.equal(await depositAdapterOriginInstance._bridgeAddress(), BridgeInstance.address);
    assert.equal(await depositAdapterOriginInstance._depositFee(), Ethers.utils.parseEther("3.2").toString());

    const depositAdapterTargetInstance
    = await DepositAdapterTargetContract.new(PermissionlessGenericHandlerInstance.address, testTargetInstance.address);
    assert.equal(await depositAdapterTargetInstance._handlerAddress(), PermissionlessGenericHandlerInstance.address);

    await depositAdapterOriginInstance.changeTargetAdapter(depositAdapterTargetInstance.address);
    assert.equal(await depositAdapterOriginInstance._targetDepositAdapter(), depositAdapterTargetInstance.address);

    await depositAdapterTargetInstance.changeOriginAdapter(depositAdapterOriginInstance.address);
    assert.equal(await depositAdapterTargetInstance._depositAdapterOrigin(), depositAdapterOriginInstance.address);
  });

  it("Deposit", async () => {
    const testTargetInstance = await TestTargetContract.new();

    const depositAdapterOriginInstance 
      = await DepositAdapterOriginContract.new(BridgeInstance.address);
    assert.equal(await depositAdapterOriginInstance._bridgeAddress(), BridgeInstance.address);
    assert.equal(await depositAdapterOriginInstance._depositFee(), Ethers.utils.parseEther("3.2").toString());

    const destBridgeInstance = await Helpers.deployBridge(
      destinationDomainID,
      accounts[0]
    );
    const destPermissionlessGenericHandlerInstance =
    await PermissionlessGenericHandlerContract.new(destBridgeInstance.address);

    const depositAdapterTargetInstance
    = await DepositAdapterTargetContract.new(destPermissionlessGenericHandlerInstance.address, testTargetInstance.address);
    assert.equal(await depositAdapterTargetInstance._handlerAddress(), destPermissionlessGenericHandlerInstance.address);

    await depositAdapterTargetInstance.sendTransaction({value: Ethers.utils.parseEther("32")});

    await depositAdapterOriginInstance.changeTargetAdapter(depositAdapterTargetInstance.address);
    assert.equal(await depositAdapterOriginInstance._targetDepositAdapter(), depositAdapterTargetInstance.address);

    await depositAdapterTargetInstance.changeOriginAdapter(depositAdapterOriginInstance.address);

    const resourceID = "0x0000000000000000000000000000000000000000000000000000000000000500";
    const ZERO_Address = "0x0000000000000000000000000000000000000000";
    const emptySetResourceData = "0x";

    PermissionlessGenericHandlerInstance =
      await PermissionlessGenericHandlerContract.new(BridgeInstance.address);

    BasicFeeHandlerInstance =
      await BasicFeeHandlerContract.new(BridgeInstance.address, BridgeInstance.address);

    await BridgeInstance.adminChangeFeeHandler(BasicFeeHandlerInstance.address);

    await BasicFeeHandlerInstance.changeFee(Ethers.utils.parseEther("0.8"));

    await BridgeInstance.adminSetResource(
      PermissionlessGenericHandlerInstance.address,
      resourceID,
      ZERO_Address,
      emptySetResourceData
    );

    await BridgeInstance.endKeygen(Helpers.mpcAddress);

    await destBridgeInstance.endKeygen(Helpers.mpcAddress);

    const pubkey = "0x123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456";
    const withdrawal_credentials = "0x010000000000000000000000" + depositAdapterTargetInstance.address.substr(2);
    const signature = "0x123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456";
    const deposit_data_root = Helpers.toHex("0x11", 32);

    const abiCoder = Ethers.utils.defaultAbiCoder;
    const executionData = abiCoder.encode([ "bytes", "bytes", "bytes", "bytes32" ], [ pubkey, withdrawal_credentials, signature, deposit_data_root ]);

    // Origin deposit

    const res = await depositAdapterOriginInstance.deposit(
      destinationDomainID,
      resourceID,
      executionData, "0x", {value: Ethers.utils.parseEther("4")});

    const internalTx = await TruffleAssert.createTransactionResult(
      BridgeInstance,
      res.tx
    );
    const depositData = internalTx.logs[0].args[4];

    TruffleAssert.eventEmitted(internalTx, "Deposit", (event) => {
      return (
        event.destinationDomainID.toNumber() === destinationDomainID &&
        event.resourceID === resourceID.toLowerCase() &&
        event.user === depositAdapterOriginInstance.address
      );
    });

    // Destination

    depositFunctionSignature = Helpers.getFunctionSignature(
      depositAdapterTargetInstance,
      "execute"
    );

    const PermissionlessGenericHandlerSetResourceData =
      Helpers.constructGenericHandlerSetResourceData(
        depositFunctionSignature,
        Helpers.blankFunctionDepositorOffset,
        Helpers.blankFunctionSig
      );

    await destBridgeInstance.adminSetResource(
      destPermissionlessGenericHandlerInstance.address,
      resourceID,
      depositAdapterTargetInstance.address,
      PermissionlessGenericHandlerSetResourceData
    );
    
    const expectedDepositNonce = 1;
    const proposal = {
      originDomainID: originDomainID,
      depositNonce: expectedDepositNonce,
      data: depositData,
      resourceID: resourceID,
    };

    const proposalSignedData = await Helpers.signTypedProposal(
      destBridgeInstance.address,
      [proposal]
    );

    const res2 = await destBridgeInstance.executeProposal(proposal, proposalSignedData, {
      from: relayer1Address,
    });

    const callData = await testTargetInstance.data();
    const calls = await testTargetInstance.calls();
    const targetContractBalance = await web3.eth.getBalance(
      testTargetInstance.address
    );

    assert.equal(targetContractBalance, Ethers.utils.parseEther("32").toString());
    assert.equal(calls, 1);
    assert.equal(callData.slice(10), executionData.slice(2));
  });
});
