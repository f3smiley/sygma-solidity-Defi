const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();

const ETHBurn = require('../build/contracts/ETHBurn.json');
const DWETH = require('../build/contracts/DWETH.json');

const web3_138 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_138));
const web3_1 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_1));

const ethBurn = new web3_138.eth.Contract(ETHBurn.abi, process.env.ETHBURN_ADDRESS);
const dweth = new web3_1.eth.Contract(DWETH.abi, process.env.DWETH_ADDRESS);

async function crossChainTransfer(from, to, amount) {
  const accounts_138 = await web3_138.eth.getAccounts();
  const accounts_1 = await web3_1.eth.getAccounts();

  // Burn ETH on chain 138
  await ethBurn.methods.burn(from, amount).send({from: accounts_138[0]});

  // Mint DWETH on chain 1
  await dweth.methods.mint(to, amount).send({from: accounts_1[0]});
}

crossChainTransfer(process.env.FROM_ADDRESS, process.env.TO_ADDRESS, process.env.AMOUNT);