
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintingToken is ERC20, Ownable {
    string private _name;
    string private _symbol;

    event TokenNameSet(string newName);
    event TokensMinted(address to, uint256 amount);
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

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }
}
