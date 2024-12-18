
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract VestingDistributor is Ownable {
    IERC20 public token;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
    }

    mapping(address => VestingSchedule) public vestingSchedules;

    event BeneficiaryAdded(address indexed beneficiary, uint256 totalAmount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration);
    event TokensReleased(address indexed beneficiary, uint256 amount);

    constructor() Ownable() {
        // Initialize with a placeholder token address
        token = IERC20(0x1234567890123456789012345678901234567890);
    }

    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    function addBeneficiary(
        address _beneficiary,
        uint256 _totalAmount,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _vestingDuration
    ) external onlyOwner {
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_totalAmount > 0, "Total amount must be greater than 0");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_vestingDuration > 0, "Vesting duration must be greater than 0");
        require(vestingSchedules[_beneficiary].totalAmount == 0, "Beneficiary already exists");

        vestingSchedules[_beneficiary] = VestingSchedule({
            totalAmount: _totalAmount,
            releasedAmount: 0,
            startTime: _startTime,
            cliffDuration: _cliffDuration,
            vestingDuration: _vestingDuration
        });

        emit BeneficiaryAdded(_beneficiary, _totalAmount, _startTime, _cliffDuration, _vestingDuration);
    }

    function releaseVestedTokens(address _beneficiary) external {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary];
        require(schedule.totalAmount > 0, "No vesting schedule for beneficiary");

        uint256 vestedAmount = calculateVestedAmount(_beneficiary);
        uint256 releasableAmount = vestedAmount - schedule.releasedAmount;
        require(releasableAmount > 0, "No tokens available for release");

        schedule.releasedAmount += releasableAmount;

        require(token.transferFrom(owner(), _beneficiary, releasableAmount), "Token transfer failed");

        emit TokensReleased(_beneficiary, releasableAmount);
    }

    function calculateVestedAmount(address _beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[_beneficiary];
        if (schedule.totalAmount == 0) {
            return 0;
        }

        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount;
        }

        uint256 timeVested = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * timeVested) / schedule.vestingDuration;
    }

    function getVestingSchedule(address _beneficiary) external view returns (VestingSchedule memory) {
        return vestingSchedules[_beneficiary];
    }
}
