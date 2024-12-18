
import React from 'react';
import { ethers } from 'ethers';

const TokenManagement: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [tokenName, setTokenName] = React.useState<string>('');
  const [tokenSymbol, setTokenSymbol] = React.useState<string>('');
  const [recipient, setRecipient] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [currentName, setCurrentName] = React.useState<string>('');
  const [currentSymbol, setCurrentSymbol] = React.useState<string>('');

  const contractAddress = '0xBc7e97Ceacb88480b740c80566501F53796c81a5';
  const chainId = 17000; // Holesky testnet

  const abi = [
    "function setTokenName(string memory newName) external",
    "function setTokenSymbol(string memory newSymbol) external",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)",
    "function mintTokens(address to, uint256 amount) external",
    "function withdrawTokens(address to, uint256 amount) external"
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
        
        // Fetch current token name and symbol
        const name = await contractInstance.name();
        const symbol = await contractInstance.symbol();
        setCurrentName(name);
        setCurrentSymbol(symbol);
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
      setCurrentName(tokenName);
      setStatus('Token name set successfully!');
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
      setCurrentSymbol(tokenSymbol);
      setStatus('Token symbol set successfully!');
    } catch (error) {
      console.error('Failed to set token symbol:', error);
      setStatus('Failed to set token symbol. Make sure you are the contract owner.');
    }
  };

  const mintTokens = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.mintTokens(recipient, ethers.utils.parseEther(amount));
      setStatus('Minting transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens minted successfully!');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setStatus('Failed to mint tokens. Make sure you are the contract owner.');
    }
  };

  const withdrawTokens = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.withdrawTokens(recipient, ethers.utils.parseEther(amount));
      setStatus('Withdrawal transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens withdrawn successfully!');
    } catch (error) {
      console.error('Failed to withdraw tokens:', error);
      setStatus('Failed to withdraw tokens. Make sure you have sufficient balance and are the contract owner.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Token Management</h1>
        
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="mb-4">Connected: {walletAddress}</p>
        )}

        <div className="mb-4">
          <p>Current Token Name: {currentName}</p>
          <p>Current Token Symbol: {currentSymbol}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="tokenName" className="block mb-2">New Token Name:</label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Enter new token name"
          />
          <button
            onClick={setName}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token Name
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="tokenSymbol" className="block mb-2">New Token Symbol:</label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Enter new token symbol"
          />
          <button
            onClick={setSymbol}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token Symbol
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="recipient" className="block mb-2">Recipient Address:</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="0x..."
          />
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block mb-2">Amount:</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="0.0"
          />
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={mintTokens}
            className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
          >
            Mint Tokens
          </button>
          <button
            onClick={withdrawTokens}
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            Withdraw Tokens
          </button>
        </div>

        {status && <p className="text-center text-sm">{status}</p>}
      </div>
    </div>
  );
};

export { TokenManagement as component };
