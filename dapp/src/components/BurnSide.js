import React, { useState } from 'react';
import { ethers } from 'ethers';
import fire from '../assets/fire.svg';

const BurnSide = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet", error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  const burnTokens = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.public-0138.defi-oracle.io');
    const signer = provider.getSigner();
    const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, process.env.REACT_APP_CONTRACT_ABI, signer);
    try {
      const tx = await contract.burn(ethers.utils.parseEther(amount));
      await tx.wait();
      console.log('Burn successful');
    } catch (error) {
      console.error('Failed to burn tokens', error);
    }
  };

  return (
    <div className="burn-side">
      <img src={fire} alt="fire" />
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>Wallet Address: {walletAddress}</p>
      <input type="text" placeholder="Amount to burn" onChange={e => setAmount(e.target.value)} />
      <button onClick={burnTokens}>Burn</button>
    </div>
  );
};

export default BurnSide;