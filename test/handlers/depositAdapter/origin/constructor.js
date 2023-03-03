/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require("truffle-assertions");
const Ethers = require("ethers");

const Helpers = require("../../helpers");

const DepositAdapterOriginContract = artifacts.require("DepositAdapterOrigin");
const PermissionlessGenericHandlerContract = artifacts.require("PermissionlessGenericHandler");

contract("DepositAdapterOrigin - [constructor]", async (accounts) => {
  const domainID = 1;
  const emptySetResourceData = "0x";
  const targetAdapterAddress = "0xcafecafecafecafecafecafecafecafecafecafe";

  let BridgeInstance;
  let HandlerInstance;

  beforeEach(async () => {
    BridgeInstance = await Helpers.deployBridge(domainID, accounts[0]);
    HandlerInstance = await PermissionlessGenericHandlerContract.new(BridgeInstance.address);
  });

  it("[sanity] contract should be deployed successfully", async () => {
    await TruffleAssert.passes(
      DepositAdapterOriginContract.new(BridgeInstance.address, targetAdapterAddress)
    );
  });

  it("[sanity] contract should be configured successfully", async () => {
    const depositAdapterOriginInstance 
      = await DepositAdapterOriginContract.new(BridgeInstance.address, targetAdapterAddress);
    assert.equal(await depositAdapterOriginInstance._bridgeAddress(), BridgeInstance.address);
    assert.equal(await depositAdapterOriginInstance._targetDepositAdapter(), targetAdapterAddress);
    assert.equal(await depositAdapterOriginInstance._depositFee(), Ethers.utils.parseEther(3.2).toString());
  });
});
