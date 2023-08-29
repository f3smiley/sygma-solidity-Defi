const Sygma = require('@sygma/sdk');

const sygma138 = new Sygma({rpcURL: 'https://rpc.public-0138.defi-oracle.io'});
const sygma1 = new Sygma({rpcURL: 'https://eth.llamarpc.com'});

sygma138.events.Burn({fromBlock: 'latest'}, (error, event) => {
  if (error) console.error('Error on Burn event:', error);
  else {
    console.log('Burn event:', event);
    // Handle event
  }
});

sygma1.events.Mint({fromBlock: 'latest'}, (error, event) => {
  if (error) console.error('Error on Mint event:', error);
  else {
    console.log('Mint event:', event);
    // Handle event
  }
});