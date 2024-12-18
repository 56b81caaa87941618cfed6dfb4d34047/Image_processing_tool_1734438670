
import React from 'react';
import { ethers } from 'ethers';

const MintingTokenManager: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [tokenName, setTokenName] = React.useState<string>('');
  const [tokenSymbol, setTokenSymbol] = React.useState<string>('');
  const [currentName, setCurrentName] = React.useState<string>('');
  const [currentSymbol, setCurrentSymbol] = React.useState<string>('');
  const [mintAmount, setMintAmount] = React.useState<string>('');
  const [mintAddress, setMintAddress] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);

  const contractAddress = '0xBc7e97Ceacb88480b740c80566501F53796c81a5';
  const chainId = 17000; // Holesky testnet

  const abi = [
    "function setTokenName(string memory newName) external",
    "function setTokenSymbol(string memory newSymbol) external",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)",
    "function mintTokens(address to, uint256 amount) external"
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          await switchNetwork();
        }

        const contractInstance = new ethers.Contract(contractAddress, abi, signer);
        setContract(contractInstance);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setStatus('Failed to connect wallet. Please try again.');
      }
    } else {
      setStatus('Please install MetaMask to use this dApp.');
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      setStatus('Failed to switch to the correct network. Please switch to Holesky testnet manually.');
    }
  };

  const setName = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.setTokenName(tokenName);
      setStatus('Setting token name. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token name set successfully!');
      await checkName();
    } catch (error) {
      console.error('Failed to set token name:', error);
      setStatus('Failed to set token name. Make sure you are the contract owner.');
    }
  };

  const setSymbol = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.setTokenSymbol(tokenSymbol);
      setStatus('Setting token symbol. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token symbol set successfully!');
      await checkSymbol();
    } catch (error) {
      console.error('Failed to set token symbol:', error);
      setStatus('Failed to set token symbol. Make sure you are the contract owner.');
    }
  };

  const checkName = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const name = await contract.name();
      setCurrentName(name);
      setStatus(`Current token name: ${name}`);
    } catch (error) {
      console.error('Failed to check token name:', error);
      setStatus('Failed to check token name.');
    }
  };

  const checkSymbol = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const symbol = await contract.symbol();
      setCurrentSymbol(symbol);
      setStatus(`Current token symbol: ${symbol}`);
    } catch (error) {
      console.error('Failed to check token symbol:', error);
      setStatus('Failed to check token symbol.');
    }
  };

  const mintTokens = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    if (!ethers.utils.isAddress(mintAddress)) {
      setStatus('Please enter a valid Ethereum address.');
      return;
    }
    if (isNaN(Number(mintAmount)) || Number(mintAmount) <= 0) {
      setStatus('Please enter a valid positive number for the mint amount.');
      return;
    }
    try {
      const tx = await contract.mintTokens(mintAddress, ethers.utils.parseEther(mintAmount));
      setStatus('Minting tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus(`Successfully minted ${mintAmount} tokens to ${mintAddress}`);
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setStatus('Failed to mint tokens. Make sure you are the contract owner and have entered valid details.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Minting Token Manager</h1>
        
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mb-4"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="mb-4">Connected: {walletAddress}</p>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Set Token Name</h2>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="New Token Name"
          />
          <button
            onClick={setName}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token Name
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Set Token Symbol</h2>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="New Token Symbol"
          />
          <button
            onClick={setSymbol}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
          >
            Set Token Symbol
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Mint Tokens</h2>
          <input
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Address to mint to"
          />
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Amount to mint"
          />
          <button
            onClick={mintTokens}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Mint Tokens
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Check Token Info</h2>
          <button
            onClick={checkName}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 mb-2"
          >
            Check Token Name
          </button>
          <button
            onClick={checkSymbol}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            Check Token Symbol
          </button>
        </div>

        {currentName && (
          <p className="mb-2">Current Token Name: {currentName}</p>
        )}
        {currentSymbol && (
          <p className="mb-2">Current Token Symbol: {currentSymbol}</p>
        )}

        {status && <p className="text-center text-sm mt-4">{status}</p>}
      </div>
    </div>
  );
};

export { MintingTokenManager as component };
