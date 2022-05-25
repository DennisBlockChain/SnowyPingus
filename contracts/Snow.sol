// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Snow is ERC20, Ownable {
uint256 public mintPrice = 1 ether;
uint256 _maxSupply = 10000;
uint256 amount = 1000;

constructor() ERC20("snow", "SNOW")  {
    _mint(msg.sender, 1000);
}

//Mints Snow is always a 1000 coins times the CoinMints which is a value send when you call the function
//Cannot the ether send when you call the function needs to be equal to the mintprice times the coinmints the mintprice is 1 ether
//amount times coinmints plus the totalsupply which is the current total amount of snow minted cannot be greater then the maxsupply which is 10000
 function mintsnow(uint256 CoinMints) external payable {
     require(msg.value == mintPrice * CoinMints, 'wrong value');
     require((amount * CoinMints + totalSupply()) <= _maxSupply, 'sold out');

     uint256 count = 0;
     while(CoinMints > count){
         count++;
        _mint(msg.sender, amount);
     } 
 }
 //gets the balance of the account address that is given when you call the function
 function getBalance(address account) external view returns(uint256){
    uint256 balance = balanceOf(account);
    return balance;
 }
 //Approves exernal address to spend your snow 
function ApproveAll(address spender) external {
    approve(spender, _maxSupply);
}
//Sends snow token to other account
function transfersnow(address reciever, uint256 SnowAmount) external payable{
    transfer(reciever, SnowAmount);
}
//Allows owner of contract to withdraw contracts balance
    function withdraw() external onlyOwner payable {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}