const assert = require('assert');
const CrossChainTransfer = artifacts.require("./CrossChainTransfer.sol");
const DWETH = artifacts.require("./DWETH.sol");
const ETHBurn = artifacts.require("./ETHBurn.sol");

contract("CrossChainTransfer", accounts => {
  let crossChainTransfer, dweth, ethBurn;

  before(async () => {
    crossChainTransfer = await CrossChainTransfer.deployed();
    dweth = await DWETH.deployed();
    ethBurn = await ETHBurn.deployed();
  });

  it("should mint DWETH on chain 1 after burning ETH on chain 138", async () => {
    const initialBalance = await dweth.balanceOf(accounts[0]);
    await crossChainTransfer.burnAndMint(accounts[0], 1, { from: accounts[0], value: web3.utils.toWei("1", "ether") });
    const finalBalance = await dweth.balanceOf(accounts[0]);
    assert.equal(finalBalance - initialBalance, web3.utils.toWei("1", "ether"), "Minting did not occur correctly after burning");
  });

  it("should emit Transfer event after successful burn and mint", async () => {
    const tx = await crossChainTransfer.burnAndMint(accounts[0], 1, { from: accounts[0], value: web3.utils.toWei("1", "ether") });
    assert.equal(tx.logs[0].event, "Transfer", "Transfer event was not emitted");
    assert.equal(tx.logs[0].args.from, accounts[0], "Transfer event emitted incorrect sender");
    assert.equal(tx.logs[0].args.to, crossChainTransfer.address, "Transfer event emitted incorrect receiver");
    assert.equal(tx.logs[0].args.value, web3.utils.toWei("1", "ether"), "Transfer event emitted incorrect value");
  });

  it("should not allow burn and mint if not enough ETH is sent", async () => {
    try {
      await crossChainTransfer.burnAndMint(accounts[0], 1, { from: accounts[0], value: web3.utils.toWei("0.5", "ether") });
      assert.fail("Expected revert not received");
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `Expected "revert", got ${error} instead`);
    }
  });
});