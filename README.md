# Cross-Chain Mint and Burn Transfer Contract

This project is a detailed Solidity contract that creates a cross-chain mint and burn transfer contract. We burn ETH on chain 138 and mint a token called DWETH on chain 1.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Please run the following command to install all the dependencies:

```
pip install -r requirements.txt
```

### Environment Variables

Create a .env file in the root directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`. For example:

```
PRIVATE_KEY_MAINNET=YOUR_PRIVATE_KEY
PRIVATE_KEY_CHAIN138=YOUR_PRIVATE_KEY
API_KEY=YOUR_API_KEY
```

### Deploying the Contracts

To deploy the contracts to chain 138 and chain 1, run the following command:

```
truffle migrate --network mainnet
truffle migrate --network chain138
```

### Running the DApp

To start the DApp, navigate to the `dapp` directory and run:

```
yarn start
```

## Built With

* [Solidity](https://soliditylang.org/) - The contract language used
* [Truffle](https://www.trufflesuite.com/) - Development framework for Ethereum
* [React](https://reactjs.org/) - The web framework used

## Authors

* **Your Name** - *Initial work* - [YourGithub](https://github.com/yourgithub)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc