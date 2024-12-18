
import React from 'react';
import { ethers } from 'ethers';

const VestingDistributor: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [tokenAddress, setTokenAddress] = React.useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = React.useState<string>('');
  const [totalAmount, setTotalAmount] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState<string>('');
  const [cliffDuration, setCliffDuration] = React.useState<string>('');
  const [vestingDuration, setVestingDuration] = React.useState<string>('');
  const [releaseAddress, setReleaseAddress] = React.useState<string>('');
  const [checkAddress, setCheckAddress] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);

  const contractAddress = '0x4a7A199EA12F7d963E5142B60B6BDE20D14130CC';
  const chainId = 17000; // Holesky testnet

  const abi = [
    "function setToken(address _token) external",
    "function addBeneficiary(address _beneficiary, uint256 _totalAmount, uint256 _startTime, uint256 _cliffDuration, uint256 _vestingDuration) external",
    "function releaseVestedTokens(address _beneficiary) external",
    "function calculateVestedAmount(address _beneficiary) public view returns (uint256)",
    "function getVestingSchedule(address _beneficiary) external view returns (tuple(uint256 totalAmount, uint256 releasedAmount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration))"
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

  const setToken = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.setToken(tokenAddress);
      setStatus('Setting token address. Waiting for confirmation...');
      await tx.wait();
      setStatus('Token address set successfully!');
    } catch (error) {
      console.error('Failed to set token address:', error);
      setStatus('Failed to set token address. Make sure you are the contract owner.');
    }
  };

  const addBeneficiary = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.addBeneficiary(
        beneficiaryAddress,
        ethers.utils.parseEther(totalAmount),
        Math.floor(new Date(startTime).getTime() / 1000),
        parseInt(cliffDuration) * 86400, // Convert days to seconds
        parseInt(vestingDuration) * 86400 // Convert days to seconds
      );
      setStatus('Adding beneficiary. Waiting for confirmation...');
      await tx.wait();
      setStatus('Beneficiary added successfully!');
    } catch (error) {
      console.error('Failed to add beneficiary:', error);
      setStatus('Failed to add beneficiary. Make sure you are the contract owner and all inputs are valid.');
    }
  };

  const releaseVestedTokens = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const tx = await contract.releaseVestedTokens(releaseAddress);
      setStatus('Releasing vested tokens. Waiting for confirmation...');
      await tx.wait();
      setStatus('Vested tokens released successfully!');
    } catch (error) {
      console.error('Failed to release vested tokens:', error);
      setStatus('Failed to release vested tokens. There might be no tokens available for release.');
    }
  };

  const checkVestedAmount = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const amount = await contract.calculateVestedAmount(checkAddress);
      setStatus(`Vested amount for ${checkAddress}: ${ethers.utils.formatEther(amount)} tokens`);
    } catch (error) {
      console.error('Failed to check vested amount:', error);
      setStatus('Failed to check vested amount. The address might not be a beneficiary.');
    }
  };

  const checkVestingSchedule = async () => {
    if (!contract) {
      setStatus('Please connect your wallet first.');
      return;
    }
    try {
      const schedule = await contract.getVestingSchedule(checkAddress);
      setStatus(`Vesting Schedule for ${checkAddress}:
        Total Amount: ${ethers.utils.formatEther(schedule.totalAmount)} tokens
        Released Amount: ${ethers.utils.formatEther(schedule.releasedAmount)} tokens
        Start Time: ${new Date(schedule.startTime.toNumber() * 1000).toLocaleString()}
        Cliff Duration: ${schedule.cliffDuration.toNumber() / 86400} days
        Vesting Duration: ${schedule.vestingDuration.toNumber() / 86400} days`);
    } catch (error) {
      console.error('Failed to check vesting schedule:', error);
      setStatus('Failed to check vesting schedule. The address might not be a beneficiary.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Vesting Distributor</h1>
        
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
          <label htmlFor="tokenAddress" className="block mb-2">Token Address:</label>
          <input
            id="tokenAddress"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="0x..."
          />
          <button
            onClick={setToken}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Set Token
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Add Beneficiary</h2>
          <input
            type="text"
            value={beneficiaryAddress}
            onChange={(e) => setBeneficiaryAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Beneficiary Address"
          />
          <input
            type="text"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Total Amount"
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          />
          <input
            type="number"
            value={cliffDuration}
            onChange={(e) => setCliffDuration(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Cliff Duration (days)"
          />
          <input
            type="number"
            value={vestingDuration}
            onChange={(e) => setVestingDuration(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Vesting Duration (days)"
          />
          <button
            onClick={addBeneficiary}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
          >
            Add Beneficiary
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Release Vested Tokens</h2>
          <input
            type="text"
            value={releaseAddress}
            onChange={(e) => setReleaseAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Beneficiary Address"
          />
          <button
            onClick={releaseVestedTokens}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
          >
            Release Vested Tokens
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Check Vesting Info</h2>
          <input
            type="text"
            value={checkAddress}
            onChange={(e) => setCheckAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Beneficiary Address"
          />
          <button
            onClick={checkVestedAmount}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300 mb-2"
          >
            Check Vested Amount
          </button>
          <button
            onClick={checkVestingSchedule}
            className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition duration-300"
          >
            Check Vesting Schedule
          </button>
        </div>

        {status && <p className="text-center text-sm mt-4 whitespace-pre-line">{status}</p>}
      </div>
    </div>
  );
};

export { VestingDistributor as component };
