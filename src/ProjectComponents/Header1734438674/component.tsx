
import React from 'react';
import * as ethers from 'ethers';

const VestingForm: React.FC = () => {
  const [address, setAddress] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [cliffDuration, setCliffDuration] = React.useState('');
  const [vestingDuration, setVestingDuration] = React.useState('');
  const [allocation, setAllocation] = React.useState('');
  const [tokenAddress, setTokenAddress] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState('');

  const contractAddress = '0x4a7A199EA12F7d963E5142B60B6BDE20D14130CC';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function addBeneficiary(address _beneficiary, uint256 _totalAmount, uint256 _startTime, uint256 _cliffDuration, uint256 _vestingDuration) external"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const network = await provider.getNetwork();
      if (network.chainId !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(chainId) }],
          });
        } catch (switchError: any) {
          setError('Failed to switch to the correct network.');
          return;
        }
      }

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const tx = await contract.addBeneficiary(
        address,
        ethers.BigNumber.from(allocation),
        startTimeUnix,
        parseInt(cliffDuration) * 86400, // convert days to seconds
        parseInt(vestingDuration) * 86400 // convert days to seconds
      );

      setStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('Beneficiary added successfully!');
    } catch (err: any) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Add Vesting Beneficiary</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Beneficiary Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Start Time:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Cliff Duration (days):</label>
          <input
            type="number"
            value={cliffDuration}
            onChange={(e) => setCliffDuration(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Vesting Duration (days):</label>
          <input
            type="number"
            value={vestingDuration}
            onChange={(e) => setVestingDuration(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
        <div>
          <label className="block mb-1">Allocation (total tokens):</label>
          <input
            type="number"
            value={allocation}
            onChange={(e) => setAllocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Token Address:</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Beneficiary
        </button>
      </form>
      {status && <p className="mt-4 text-green-600">{status}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export { VestingForm as component };
