const Sygma = require('@sygma/sdk');

const sygma1 = new Sygma({rpcURL: 'https://eth.llamarpc.com'});

// Confirm 'Mint' event on chain 1
sygma1.events.Mint({fromBlock: 'latest'}, (error, event) => {
  if (error) {
    console.error('Error on Mint event:', error);
    return;
  }

  console.log('Mint event confirmed on chain 1:', event);
});

// Update Sygma SDK listeners as needed
// This is a placeholder, update as per your application's requirements
sygma1.events.removeAllListeners('Mint');