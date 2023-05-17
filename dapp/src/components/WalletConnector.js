import React, { useState } from 'react';
import Web3 from 'web3';

const WalletConnector = () => {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } else {
      alert('Ethereum browser extension like Metamask is required.');
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      {account && <p>Connected Account: {account}</p>}
    </div>
  );
};

export default WalletConnector;