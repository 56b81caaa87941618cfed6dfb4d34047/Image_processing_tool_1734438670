
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract StakingContract is ReentrancyGuard, Ownable {
    uint256 public constant REWARD_PRECISION = 1e18;
    uint256 public immutable rewardRate; // Reward ETH per second per staked ETH
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) private _balances;

    uint256 private _totalSupply;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsAdded(uint256 amount);

    constructor() Ownable() {
        rewardRate = (1 * REWARD_PRECISION) / 86400; // 1 ETH per day per ETH staked
        lastUpdateTime = block.timestamp;
    }

    function stake() external payable nonReentrant updateReward(msg.sender) {
        require(msg.value > 0, "Cannot stake 0");
        _totalSupply += msg.value;
        _balances[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "ETH transfer failed");
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * REWARD_PRECISION) / _totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return
            ((_balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / REWARD_PRECISION) +
            rewards[account];
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function pendingRewards(address account) external view returns (uint256) {
        return earned(account);
    }

    function addRewards() external payable onlyOwner {
        require(msg.value > 0, "Must add some ETH");
        emit RewardsAdded(msg.value);
    }

    receive() external payable {
        revert("Use stake() to stake ETH");
    }

    fallback() external payable {
        revert("Use stake() to stake ETH");
    }
}
