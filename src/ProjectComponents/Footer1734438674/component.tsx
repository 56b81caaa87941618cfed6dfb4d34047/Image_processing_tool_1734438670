
import React from 'react';
import { ethers } from 'ethers';

const VestingDistributorManager: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [tokenAddress, setTokenAddress] = React.useState<string>('');
  const [currentTokenAddress, setCurrentTokenAddress] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);

  const contractAddress = '0x4a7A199EA12F7d963E5142B60B6BDE20D14130CC';
  const chainId = 17000; // Holesky testnet

  const abi = [
    "function setToken(address _token) external",
    "function token() public view returns (address)"
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
        await checkCurrentToken();
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

  const setToken = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    if (!ethers.utils.isAddress(tokenAddress)) {
      setStatus('Please enter a valid Ethereum address.');
      return;
    }
    try {
      const tx = await contract.setToken(tokenAddress);
      setStatus('Setting token address. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token address set successfully!');
      await checkCurrentToken();
    } catch (error) {
      console.error('Failed to set token address:', error);
      setStatus('Failed to set token address. Make sure you are the contract owner.');
    }
  };

  const checkCurrentToken = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tokenAddress = await contract.token();
      setCurrentTokenAddress(tokenAddress);
      setStatus(`Current token address: ${tokenAddress}`);
    } catch (error) {
      console.error('Failed to check current token address:', error);
      setStatus('Failed to check current token address.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5" style={{ backgroundImage: `url('https://raw.githubusercontent.com/56b81caaa87941618cfed6dfb4d34047/Image_processing_tool_1734438670/${window.MI_PROJECT_GIT_REF || 'main'}/src/assets/images/e88973d29db04f13bb228da075a1447c.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Vesting Distributor Manager</h1>
        
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
          <h2 className="text-xl font-semibold mb-2">Set Token Address</h2>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Token Address"
          />
          <button
            onClick={setToken}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token Address
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Current Token Info</h2>
          <button
            onClick={checkCurrentToken}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            Check Current Token Address
          </button>
        </div>

        {currentTokenAddress && (
          <p className="mb-2">Current Token Address: {currentTokenAddress}</p>
        )}

        {status && <p className="text-center text-sm mt-4">{status}</p>}
      </div>
    </div>
  );
};

export { VestingDistributorManager as component };
