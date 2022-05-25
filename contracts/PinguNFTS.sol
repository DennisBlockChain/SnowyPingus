// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../client/node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/Snow.sol";

contract Pingus is ERC721, Ownable {
uint256 public mintPrice = 1000;
uint256 public totalSupply;
uint256 public maxSupply;
bool public isMintEnabled;
Snow SnowContract;

event NftBought(address _seller, address _buyer, uint256 _price);

//Keeps tracks of the NFT id and the wallet address it belongs to
mapping(address => uint256) public mintedWallets;

    constructor(address SnowAddress) payable ERC721('PinguNFT', 'PINGUS') {
        maxSupply = 8;
        SnowContract = Snow(SnowAddress);
        SnowContract.ApproveAll(address(this));
    }
//Enables the minting of NFTS only the owner can call this function
    function toggleIsMintEnabled() external onlyOwner {
        isMintEnabled = !isMintEnabled;
    }
//Gets snow balance from snow contract
    function SnowBalance(address account) external view returns(uint256){
       return SnowContract.getBalance(account);
    }
//Get the amount of pingus 
    function Balance(address account) external view returns(uint256){
        return balanceOf(account);
    }
//Mint Pingu NFT -Cannot mint more then 3 pingu NFTs at a time -1 Wallet cannot Mint if the wallet holds 3 or more pingu NFTS 
//Cannot mint 0 NFTS -mintPrice times NFTS cannot be greater then snow balance -isMintEnabled needs to be true
//maxSupply needs to be greater then totalsupply or you won't be able to mind anymore NFTS
    function mint(uint NFTS) external payable{
        require(NFTS <= 3, 'Cannot have more then 3 NFTS');
        require(NFTS != 0, 'Cannot mint 0 NFTS');
        require(mintPrice * NFTS <= SnowContract.getBalance(msg.sender), 'not enough balance');
        require(isMintEnabled, 'minting not enabled');
        require(mintedWallets[msg.sender] < 3, 'exceeds max per wallet');
        require(maxSupply > totalSupply, 'sold out');
        SnowContract.transferFrom(msg.sender, address(this), mintPrice * NFTS);
        uint256 count = 0;
        while(NFTS > count){
            count++;
        mintedWallets[msg.sender]++;
        uint256 TokenId = totalSupply++;
        _safeMint(msg.sender, TokenId);
        }
    }
    
//Allows owner of contract to withdraw contracts snow balance
    function withdrawSnow() external onlyOwner {
        uint balance =  SnowContract.getBalance(address(this));    
        SnowContract.transferFrom(address(this), msg.sender, balance);
    }

//Transfer Pingu NFT
    function TransferNFT(uint256 _tokenId, address _reciever) external payable{
        require(msg.sender == ownerOf(_tokenId), 'Not owner of this token');
        _transfer(msg.sender, _reciever, _tokenId);
    }
}