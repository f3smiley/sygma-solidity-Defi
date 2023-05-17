import React, { useState } from 'react';
import WalletConnector from './WalletConnector';
import ice from '../assets/ice.svg';

const MintSide = () => {
    const [walletAddress, setWalletAddress] = useState('');

    const handleConnectWallet = (address) => {
        setWalletAddress(address);
    };

    return (
        <div className="mint-side">
            <img src={ice} alt="Mint" />
            <h2>Mint DWETH</h2>
            <WalletConnector onConnect={handleConnectWallet} />
            {walletAddress && (
                <div>
                    <h3>Connected Wallet Address:</h3>
                    <p>{walletAddress}</p>
                </div>
            )}
            <p>Send ETH to the following address to mint DWETH:</p>
            <p>{process.env.REACT_APP_MINT_ADDRESS}</p>
        </div>
    );
};

export default MintSide;