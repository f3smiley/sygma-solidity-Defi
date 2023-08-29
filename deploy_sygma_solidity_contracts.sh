#!/bin/bash

# Clone the Sygma Solidity contracts repository
git clone https://github.com/sygmaprotocol/sygma-solidity.git

# Navigate into the cloned repository
cd sygma-solidity

# Compile the contracts
truffle compile

# Deploy the contracts to the specified networks
truffle migrate --network chain138
truffle migrate --network chain1

# Navigate back to the original directory
cd ..