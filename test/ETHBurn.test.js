const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledETHBurn = require('../build/ETHBurn.json');

let accounts;
let ethBurn;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  ethBurn = await new web3.eth.Contract(JSON.parse(compiledETHBurn.interface))
    .deploy({ data: compiledETHBurn.bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('ETHBurn', () => {
  it('deploys a contract', () => {
    assert.ok(ethBurn.options.address);
  });

  it('allows one account to burn ETH', async () => {
    await ethBurn.methods.burn().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    const balance = await web3.eth.getBalance(ethBurn.options.address);
    assert.equal(balance, '0');
  });

  it('emits a Burn event when ETH is burned', async () => {
    const receipt = await ethBurn.methods.burn().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    assert.equal(receipt.events.Burn.event, 'Burn');
    assert.equal(receipt.events.Burn.returnValues.burner, accounts[0]);
    assert.equal(receipt.events.Burn.returnValues.value, web3.utils.toWei('1', 'ether'));
  });
});