
import React from 'react';
import { ethers } from 'ethers';

const MintingTokenManager: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [tokenName, setTokenName] = React.useState<string>('');
  const [tokenSymbol, setTokenSymbol] = React.useState<string>('');
  const [mintAmount, setMintAmount] = React.useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>('');
  const [recipientAddress, setRecipientAddress] = React.useState<string>('');
  const [currentTokenInfo, setCurrentTokenInfo] = React.useState<{ name: string; symbol: string }>({ name: '', symbol: '' });

  const contractAddress = '0xBc7e97Ceacb88480b740c80566501F53796c81a5';
  const chainId = 17000; // Holesky testnet

  const abi = [
    "function setTokenName(string memory newName) external",
    "function setTokenSymbol(string memory newSymbol) external",
    "function getTokenInfo() external view returns (string memory tokenName, string memory tokenSymbol)",
    "function mintTokens(address to, uint256 amount) external",
    "function withdrawTokens(address to, uint256 amount) external",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)"
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
        await updateTokenInfo();
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

  const updateTokenInfo = async () => {
    if (!contract) return;
    try {
      const [name, symbol] = await contract.getTokenInfo();
      setCurrentTokenInfo({ name, symbol });
    } catch (error) {
      console.error('Failed to get token info:', error);
      setStatus('Failed to get token info.');
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
      await updateTokenInfo();
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
      await updateTokenInfo();
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
    if (!ethers.utils.isAddress(recipientAddress)) {
      setStatus('Please enter a valid Ethereum address for the recipient.');
      return;
    }
    try {
      const amount = ethers.utils.parseEther(mintAmount);
      const tx = await contract.mintTokens(recipientAddress, amount);
      setStatus('Minting tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens minted successfully!');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setStatus('Failed to mint tokens. Make sure you are the contract owner and the amount is valid.');
    }
  };

  const withdrawTokens = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    if (!ethers.utils.isAddress(recipientAddress)) {
      setStatus('Please enter a valid Ethereum address for the recipient.');
      return;
    }
    try {
      const amount = ethers.utils.parseEther(withdrawAmount);
      const tx = await contract.withdrawTokens(recipientAddress, amount);
      setStatus('Withdrawing tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens withdrawn successfully!');
    } catch (error) {
      console.error('Failed to withdraw tokens:', error);
      setStatus('Failed to withdraw tokens. Make sure you are the contract owner and have sufficient balance.');
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
          <h2 className="text-xl font-semibold mb-2">Current Token Info</h2>
          <p>Name: {currentTokenInfo.name}</p>
          <p>Symbol: {currentTokenInfo.symbol}</p>
        </div>

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
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token Symbol
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Mint Tokens</h2>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Recipient Address"
          />
          <input
            type="text"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Amount to Mint"
          />
          <button
            onClick={mintTokens}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            Mint Tokens
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Withdraw Tokens</h2>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Recipient Address"
          />
          <input
            type="text"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Amount to Withdraw"
          />
          <button
            onClick={withdrawTokens}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Withdraw Tokens
          </button>
        </div>

        {status && <p className="text-center text-sm mt-4">{status}</p>}
      </div>
    </div>
  );
};

export { MintingTokenManager as component };
