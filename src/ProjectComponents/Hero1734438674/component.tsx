
import React from 'react';
import { ethers } from 'ethers';

const VestingDistributor: React.FC = () => {
  const [beneficiaryAddress, setBeneficiaryAddress] = React.useState('');
  const [totalAmount, setTotalAmount] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [cliffDuration, setCliffDuration] = React.useState('');
  const [vestingDuration, setVestingDuration] = React.useState('');
  const [releaseAddress, setReleaseAddress] = React.useState('');
  const [scheduleAddress, setScheduleAddress] = React.useState('');
  const [vestingSchedule, setVestingSchedule] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const contractAddress = '0x4a7A199EA12F7d963E5142B60B6BDE20D14130CC';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function addBeneficiary(address _beneficiary, uint256 _totalAmount, uint256 _startTime, uint256 _cliffDuration, uint256 _vestingDuration) external",
    "function releaseVestedTokens(address _beneficiary) external",
    "function getVestingSchedule(address _beneficiary) external view returns (tuple(uint256 totalAmount, uint256 releasedAmount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration))"
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              setError('Please add the Holesky testnet to your wallet and try again.');
            } else {
              setError('Failed to switch to the correct network.');
            }
            return null;
          }
        }
        return provider.getSigner();
      } catch (error) {
        setError('Failed to connect wallet.');
        return null;
      }
    } else {
      setError('Please install MetaMask!');
      return null;
    }
  };

  const addBeneficiary = async () => {
    const signer = await connectWallet();
    if (!signer) return;

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.addBeneficiary(
        beneficiaryAddress,
        ethers.utils.parseEther(totalAmount),
        Math.floor(new Date(startTime).getTime() / 1000),
        Number(cliffDuration) * 86400, // Convert days to seconds
        Number(vestingDuration) * 86400 // Convert days to seconds
      );
      await tx.wait();
      setSuccess('Beneficiary added successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const releaseTokens = async () => {
    const signer = await connectWallet();
    if (!signer) return;

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.releaseVestedTokens(releaseAddress);
      await tx.wait();
      setSuccess('Tokens released successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getSchedule = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    try {
      const schedule = await contract.getVestingSchedule(scheduleAddress);
      setVestingSchedule({
        totalAmount: ethers.utils.formatEther(schedule.totalAmount),
        releasedAmount: ethers.utils.formatEther(schedule.releasedAmount),
        startTime: new Date(schedule.startTime.toNumber() * 1000).toLocaleString(),
        cliffDuration: schedule.cliffDuration.toNumber() / 86400, // Convert seconds to days
        vestingDuration: schedule.vestingDuration.toNumber() / 86400 // Convert seconds to days
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="bg-black py-16 text-white w-full h-full">
      <div className="container mx-auto px-4 flex flex-col items-center h-full">
        <h1 className="text-4xl font-bold mb-8">Token Vesting Distributor</h1>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Add Beneficiary</h2>
          <input className="w-full p-2 mb-2 text-black" type="text" placeholder="Beneficiary Address" value={beneficiaryAddress} onChange={(e) => setBeneficiaryAddress(e.target.value)} />
          <input className="w-full p-2 mb-2 text-black" type="number" placeholder="Total Amount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
          <input className="w-full p-2 mb-2 text-black" type="datetime-local" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input className="w-full p-2 mb-2 text-black" type="number" placeholder="Cliff Duration (days)" value={cliffDuration} onChange={(e) => setCliffDuration(e.target.value)} />
          <input className="w-full p-2 mb-2 text-black" type="number" placeholder="Vesting Duration (days)" value={vestingDuration} onChange={(e) => setVestingDuration(e.target.value)} />
          <button className="w-full bg-blue-500 p-2 rounded" onClick={addBeneficiary}>Add Beneficiary</button>
        </div>

        <div className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Release Vested Tokens</h2>
          <input className="w-full p-2 mb-2 text-black" type="text" placeholder="Beneficiary Address" value={releaseAddress} onChange={(e) => setReleaseAddress(e.target.value)} />
          <button className="w-full bg-green-500 p-2 rounded" onClick={releaseTokens}>Release Tokens</button>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Get Vesting Schedule</h2>
          <input className="w-full p-2 mb-2 text-black" type="text" placeholder="Beneficiary Address" value={scheduleAddress} onChange={(e) => setScheduleAddress(e.target.value)} />
          <button className="w-full bg-yellow-500 p-2 rounded mb-4" onClick={getSchedule}>Get Schedule</button>
          
          {vestingSchedule && (
            <div className="bg-gray-800 p-4 rounded">
              <p>Total Amount: {vestingSchedule.totalAmount} tokens</p>
              <p>Released Amount: {vestingSchedule.releasedAmount} tokens</p>
              <p>Start Time: {vestingSchedule.startTime}</p>
              <p>Cliff Duration: {vestingSchedule.cliffDuration} days</p>
              <p>Vesting Duration: {vestingSchedule.vestingDuration} days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { VestingDistributor as component };
