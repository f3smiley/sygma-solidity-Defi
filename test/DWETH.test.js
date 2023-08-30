const assert = require('assert');
const DWETH = artifacts.require("./contracts/DWETH.sol");

contract("DWETH", accounts => {
  let dweth;
  const owner = accounts[0];
  const user = accounts[1];

  beforeEach(async () => {
    dweth = await DWETH.new({ from: owner });
  });

  it("should mint DWETH tokens", async () => {
    const amount = web3.utils.toWei('1', 'ether');
    await dweth.mint(user, amount, { from: owner });
    const balance = await dweth.balanceOf(user);
    assert.equal(balance.toString(), amount);
  });

  it("should burn DWETH tokens", async () => {
    const amount = web3.utils.toWei('1', 'ether');
    await dweth.mint(user, amount, { from: owner });
    await dweth.burn(amount, { from: user });
    const balance = await dweth.balanceOf(user);
    assert.equal(balance.toString(), '0');
  });

  it("should not allow non-owners to mint tokens", async () => {
    const amount = web3.utils.toWei('1', 'ether');
    try {
      await dweth.mint(user, amount, { from: user });
      assert.fail();
    } catch (err) {
      assert.ok(/revert/.test(err.message));
    }
  });

  it("should not allow burning more tokens than balance", async () => {
    const amount = web3.utils.toWei('1', 'ether');
    try {
      await dweth.burn(amount, { from: user });
      assert.fail();
    } catch (err) {
      assert.ok(/revert/.test(err.message));
    }
  });
});