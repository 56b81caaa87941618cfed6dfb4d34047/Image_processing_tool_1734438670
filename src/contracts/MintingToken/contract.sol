
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintingToken is ERC20, Ownable {
    string private _customName;
    string private _customSymbol;

    event TokenNameSet(string newName);
    event TokenSymbolSet(string newSymbol);
    event TokensMinted(address to, uint256 amount);
    event TokensWithdrawn(address to, uint256 amount);

    constructor() ERC20("InitialName", "INS") Ownable() {
        _customName = "InitialName";
        _customSymbol = "INS";
    }

    function setTokenName(string memory newName) external onlyOwner {
        require(bytes(newName).length > 0, "Name cannot be empty");
        _customName = newName;
        emit TokenNameSet(newName);
    }

    function setTokenSymbol(string memory newSymbol) external onlyOwner {
        require(bytes(newSymbol).length > 0, "Symbol cannot be empty");
        _customSymbol = newSymbol;
        emit TokenSymbolSet(newSymbol);
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
