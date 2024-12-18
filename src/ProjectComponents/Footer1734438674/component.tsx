
import React from 'react';
import { ethers } from 'ethers';

const MintingTokenFooter: React.FC = () => {
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
  const SAFE_GAS_LIMIT = 100000; // 300k gas units

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

  const ensureConnection = async () => {
    if (!contract) {
      await connectWallet();
    }
    if (!contract) {
      throw new Error('Wallet connection failed');
    }
  };

  const setName = async () => {
    try {
      await ensureConnection();
      const tx = await contract!.setTokenName(tokenName, { gasLimit: SAFE_GAS_LIMIT });
      setStatus('Setting token name. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token name set successfully!');
      await updateTokenInfo();
    } catch (error: any) {
      console.error('Failed to set token name:', error);
      if (error.message.toLowerCase().includes('gas') || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        setStatus('Transaction failed: Gas error. Please try again or adjust amount.');
      } else {
        setStatus('Failed to set token name. Make sure you are the contract owner.');
      }
    }
  };

  const setSymbol = async () => {
    try {
      await ensureConnection();
      const tx = await contract!.setTokenSymbol(tokenSymbol, { gasLimit: SAFE_GAS_LIMIT });
      setStatus('Setting token symbol. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token symbol set successfully!');
      await updateTokenInfo();
    } catch (error: any) {
      console.error('Failed to set token symbol:', error);
      if (error.message.toLowerCase().includes('gas') || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        setStatus('Transaction failed: Gas error. Please try again or adjust amount.');
      } else {
        setStatus('Failed to set token symbol. Make sure you are the contract owner.');
      }
    }
  };

  const mintTokens = async () => {
    if (!ethers.utils.isAddress(recipientAddress)) {
      setStatus('Please enter a valid Ethereum address for the recipient.');
      return;
    }
    try {
      await ensureConnection();
      const amount = ethers.utils.parseEther(mintAmount);
      const tx = await contract!.mintTokens(recipientAddress, amount, { gasLimit: SAFE_GAS_LIMIT });
      setStatus('Minting tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens minted successfully!');
    } catch (error: any) {
      console.error('Failed to mint tokens:', error);
      if (error.message.toLowerCase().includes('gas') || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        setStatus('Transaction failed: Gas error. Please try again or adjust amount.');
      } else {
        setStatus('Failed to mint tokens. Make sure you are the contract owner and the amount is valid.');
      }
    }
  };

  const withdrawTokens = async () => {
    if (!ethers.utils.isAddress(recipientAddress)) {
      setStatus('Please enter a valid Ethereum address for the recipient.');
      return;
    }
    try {
      await ensureConnection();
      const amount = ethers.utils.parseEther(withdrawAmount);
      const tx = await contract!.withdrawTokens(recipientAddress, amount, { gasLimit: SAFE_GAS_LIMIT });
      setStatus('Withdrawing tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens withdrawn successfully!');
    } catch (error: any) {
      console.error('Failed to withdraw tokens:', error);
      if (error.message.toLowerCase().includes('gas') || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        setStatus('Transaction failed: Gas error. Please try again or adjust amount.');
      } else {
        setStatus('Failed to withdraw tokens. Make sure you are the contract owner and have sufficient balance.');
      }
    }
  };

  return (
    <footer className="bg-gray-800 text-white p-4 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <p className="text-sm">Current Token: {currentTokenInfo.name} ({currentTokenInfo.symbol})</p>
          {walletAddress && <p className="text-xs">Connected: {walletAddress}</p>}
        </div>
        <div className="flex flex-wrap justify-center items-center space-x-2">
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="New Token Name"
          />
          <button onClick={setName} className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm">Set Name</button>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="New Token Symbol"
          />
          <button onClick={setSymbol} className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm">Set Symbol</button>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="Recipient Address"
          />
          <input
            type="text"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="Mint Amount"
          />
          <button onClick={mintTokens} className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-sm">Mint</button>
          <input
            type="text"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            placeholder="Withdraw Amount"
          />
          <button onClick={withdrawTokens} className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-sm">Withdraw</button>
        </div>
      </div>
      {status && <p className="text-center text-xs mt-2">{status}</p>}
    </footer>
  );
};

export { MintingTokenFooter as component };
