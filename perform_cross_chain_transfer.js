const Sygma = require('@sygma/sdk');

const sygma138 = new Sygma({rpcURL: 'https://rpc.public-0138.defi-oracle.io'});
const sygma1 = new Sygma({rpcURL: 'https://eth.llamarpc.com'});

let amount, recipient, sender, bridgeOperator;

// Call 'burn' function
sygma138.methods.burn(amount, recipient).send({from: sender, gas: 1000000})
  .then(() => {
    // Listen for 'Burn' event
    sygma138.events.Burn({fromBlock: 'latest'}, (error, event) => {
      if (error) console.error(error);
      else {
        // Retrieve data
        ({amount, recipient} = event.returnValues);

        // Call 'mint' function
        sygma1.methods.mint(amount, recipient).send({from: bridgeOperator, gas: 1000000})
          .catch(console.error);
      }
    });
  })
  .catch(console.error);