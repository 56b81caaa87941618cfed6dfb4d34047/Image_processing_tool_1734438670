
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintingToken is ERC20, Ownable {
    string private _name;
    string private _symbol;

    event TokenNameSet(string newName);
    event TokenSupplySet(uint256 newSupply);
    event TokensWithdrawn(address to, uint256 amount);

    constructor() ERC20("MintingToken", "MTK") Ownable() {
        _name = "MintingToken";
        _symbol = "MTK";
    }

    function setTokenName(string memory newName) external onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        _name = newName;
        emit TokenNameSet(newName);
    }

    function setTokenSupply(uint256 newSupply) external onlyOwner {
        require(newSupply >= totalSupply(), "New supply must be greater than or equal to current supply");
        uint256 additionalSupply = newSupply - totalSupply();
        if (additionalSupply > 0) {
            _mint(address(this), additionalSupply);
        }
        emit TokenSupplySet(newSupply);
    }

    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount <= balanceOf(address(this)), "Insufficient balance in contract");
        _transfer(address(this), to, amount);
        emit TokensWithdrawn(to, amount);
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }
}
