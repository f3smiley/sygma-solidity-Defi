const Web3 = require('web3');
const dotenv = require('dotenv');
dotenv.config();

const CrossChainTransfer = require('../build/contracts/CrossChainTransfer.json');
const DWETH = require('../build/contracts/DWETH.json');
const ETHBurn = require('../build/contracts/ETHBurn.json');

const web3Chain138 = new Web3(process.env.RPC_URL_CHAIN_138);
const web3Chain1 = new Web3(process.env.RPC_URL_CHAIN_1);

const crossChainTransfer = new web3Chain138.eth.Contract(
  CrossChainTransfer.abi,
  process.env.CROSS_CHAIN_TRANSFER_ADDRESS
);

const dweth = new web3Chain1.eth.Contract(
  DWETH.abi,
  process.env.DWETH_ADDRESS
);

const ethBurn = new web3Chain138.eth.Contract(
  ETHBurn.abi,
  process.env.ETH_BURN_ADDRESS
);

crossChainTransfer.events.Transfer({}, (error, event) => {
  if (error) console.error('Error on Transfer event', error);
  else console.log('Transfer event', event);
});

dweth.events.Mint({}, (error, event) => {
  if (error) console.error('Error on Mint event', error);
  else console.log('Mint event', event);
});

ethBurn.events.Burn({}, (error, event) => {
  if (error) console.error('Error on Burn event', error);
  else console.log('Burn event', event);
});