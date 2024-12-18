
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintingToken is ERC20, Ownable {
    string private _customName;
    string private _customSymbol;

    event TokenNameChanged(string oldName, string newName);
    event TokenSymbolChanged(string oldSymbol, string newSymbol);
    event TokensMinted(address to, uint256 amount);
    event TokensWithdrawn(address to, uint256 amount);

    constructor(string memory initialName, string memory initialSymbol) ERC20(initialName, initialSymbol) Ownable() {
        _customName = initialName;
        _customSymbol = initialSymbol;
    }

    function setTokenName(string memory newName) external onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        require(keccak256(bytes(newName)) != keccak256(bytes(_customName)), "New name must be different");
        string memory oldName = _customName;
        _customName = newName;
        emit TokenNameChanged(oldName, newName);
    }

    function setTokenSymbol(string memory newSymbol) external onlyOwner {
        require(bytes(newSymbol).length > 0, "Symbol cannot be empty");
        require(keccak256(bytes(newSymbol)) != keccak256(bytes(_customSymbol)), "New symbol must be different");
        string memory oldSymbol = _customSymbol;
        _customSymbol = newSymbol;
        emit TokenSymbolChanged(oldSymbol, newSymbol);
    }

    function getTokenInfo() external view returns (string memory tokenName, string memory tokenSymbol) {
        return (_customName, _customSymbol);
    }

    function name() public view virtual override returns (string memory) {
        return _customName;
    }

    function symbol() public view virtual override returns (string memory) {
        return _customSymbol;
    }

    function mintTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount <= balanceOf(msg.sender), "Insufficient balance");
        _transfer(msg.sender, to, amount);
        emit TokensWithdrawn(to, amount);
    }
}
