```javascript
import React, { useState } from 'react';
import BurnSide from './components/BurnSide';
import MintSide from './components/MintSide';
import WalletConnector from './components/WalletConnector';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  return (
    <div className="App">
      <WalletConnector onConnect={handleWalletConnect} />
      <div className="split-screen">
        <BurnSide walletAddress={walletAddress} />
        <MintSide walletAddress={walletAddress} />
      </div>
    </div>
  );
}

export default App;
```