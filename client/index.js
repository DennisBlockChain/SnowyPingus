import Web3 from 'web3';
import pingu from "../build/contracts/Pingus.json";
import snow from "../build/contracts/Snow.json";
import Pingus from "../client/pingu.json";

//Web3 provider
const web3 = new Web3(
  Web3.givenProvider || 'HTTP://127.0.0.1:7545'
);

//Global variable
let account;

//Create new contract instance
const pinguAddress = "0x9436722Bf1cE1394ff264b0cBD46fd7dbdb10e26";
const snowAddress = "0x059310323a0951F7349B90Ab838b14D8283560aE";
const Pingucontract = new web3.eth.Contract(pingu.abi, pinguAddress);
const Snowcontract = new web3.eth.Contract(snow.abi, snowAddress); 

//Detects account change in wallet
ethereum.on('accountsChanged', async function () {
  Check();
  GetWalletAdress();
  GetWalletBalanceETH();
  GetWalletBalanceSnow();
  GetWalletBalancePinguNFTS();
  initPingus();
});

//Function to connect web3 wallet to website calls functions
async function WalletConnect() {
  const accounts = await web3.eth.requestAccounts();
  account = accounts[0];
  GetWalletAdress();
  GetWalletBalanceETH();
  GetWalletBalanceSnow();
  GetWalletBalancePinguNFTS();
}

//Gets users active current account
async function GetAccounts(){
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
}

//Checks if Pingu address is allowed to spend SnowTokens on current active account and if the address if the owner of the contract
async function Check(){
  await GetAccounts();
    //check if no account is connected
    if(account === undefined){
      document.getElementById('btn-MintNFT').style.display = "none";
      document.getElementById('myNumberPingu').style.display = "none";
      document.getElementById('btn-enableMintNFT').style.display = "none";
      document.getElementById('btn-WithdrawPinguBalance').style.display = "none";
      document.getElementById('btn-WithdrawSnowBalance').style.display = "none";
      document.getElementById('btn-ApproveSpender').style.display = "none";
    }
  //checks if pingu contract is approved
  if(await Snowcontract.methods.allowance(account, pinguAddress).call() != 0){
    document.getElementById('btn-ApproveSpender').style.display = "none";
    document.getElementById('btn-MintNFT').style.display = "inline";
    document.getElementById('myNumberPingu').style.display = "inline";
  }else{
    document.getElementById('btn-ApproveSpender').style.display = "inline";
    document.getElementById('btn-MintNFT').style.display = "none";
    document.getElementById('myNumberPingu').style.display = "none";
  }
  //check if account is the owner of the pingu contract
  if(await Pingucontract.methods.owner().call() === account){
    document.getElementById('btn-enableMintNFT').style.display = "inline";
    document.getElementById('btn-WithdrawPinguBalance').style.display = "inline";
    document.getElementById('btn-WithdrawSnowBalance').style.display = "inline";
  }else{
    document.getElementById('btn-enableMintNFT').style.display = "none";
    document.getElementById('btn-WithdrawPinguBalance').style.display = "none";
    document.getElementById('btn-WithdrawSnowBalance').style.display = "none";
  }
}

//Gets all the pingus of the current active account and shows them in html
async function initPingus() {
  const NFTcontainer = document.getElementById("NFTRow");
  NFTcontainer.innerHTML = "";
  const row = document.createElement("div");
  row.className = "row justify-content-center"
  NFTcontainer.appendChild(row);
  for (i = 0; i < Pingus.length; i++) {
    if (await Pingucontract.methods.ownerOf(Pingus[i].id).call() == account) {
      const OwnerAddress = document.createTextNode(await Pingucontract.methods.ownerOf(Pingus[i].id).call());
      const div = document.createElement("div");
      const div2 = document.createElement("div");
      const div3 = document.createElement("div");
      const div4 = document.createElement("div");
      const image = document.createElement("img");
      const strongName = document.createElement("strong");
      const strongOwner = document.createElement("strong");
      const TextName = document.createTextNode("Name: ");
      const TextNFTName = document.createTextNode(Pingus[i].name);
      const Owner = document.createTextNode(" Owner: ");
      const SendNFT = document.createElement("button");
      const InputAddress = document.createElement("input");
      const br = document.createElement("br");

      InputAddress.className = "form-control";
      InputAddress.placeholder = "Input Address here";
      InputAddress.id = Pingus[i].id;
      SendNFT.onclick = async function TransferNFT(){
        const id = this.value;
        const address = document.getElementById(id).value;
        if(web3.utils.isAddress(address) === false){
          alert("This is not a valid address");
        }else{
        await Pingucontract.methods.TransferNFT(id, address).send({from: account});
        await GetWalletBalanceETH();
        GetWalletBalancePinguNFTS();
        initPingus();
        }
      };
      SendNFT.textContent = "Send NFT";
      SendNFT.value = Pingus[i].id;
      SendNFT.className = "btn btn-primary";
      div.className = "TableSelect col-sm";
      div3.className = "card-body";
      div4.className = "input-group";
      image.className = "PinguImages img-fluid";
      image.src = Pingus[i].picture;

      strongName.appendChild(TextNFTName);
      strongOwner.appendChild(OwnerAddress);
      div2.appendChild(image);
      div3.appendChild(TextName);
      div3.appendChild(strongName);
      div3.appendChild(br);
      div3.appendChild(Owner);
      div3.appendChild(strongOwner);
      div3.appendChild(div4);
      div4.appendChild(SendNFT);
      div4.appendChild(InputAddress);
      div.appendChild(div2);
      div.appendChild(div3);
      row.appendChild(div);
    }
  }
}

//Gets the current active account wallet address and displays it in the header
async function GetWalletAdress() {
  await GetAccounts();
  if (account === undefined) {
    const button = document.getElementById('btn-connectwallet');
    document.getElementById('Wallet-Address').innerHTML = "";
    document.getElementById('account').appendChild(button).style.display = "block";
  } else {
    document.getElementById('btn-connectwallet').style.display = "none";
    document.getElementById('Wallet-Address').innerHTML = "";
    document.getElementById('Wallet-Address').append(account);
  }
}

//Gets the current active account wallet ETH balance and displays it in the header
async function GetWalletBalanceETH() {
  await GetAccounts();
  if(account === undefined){
    document.getElementById('accountBalance').innerHTML ="ETH balalance: 0 ";
  }else {
  const WalletBalance = await web3.eth.getBalance(account).then(result => web3.utils.fromWei(result, "ether"));
  document.getElementById('accountBalance').innerHTML ="ETH balance: " + WalletBalance;
  }
}

//Gets the current active account wallet Snow balance and displays it in the header
async function GetWalletBalanceSnow() {
  await GetAccounts();
  if(account === undefined){
    document.getElementById('accountSnowBalance').innerHTML ="Snowcoin balalance: 0 ";
  }else {
  const WalletBalance = await Snowcontract.methods.getBalance(account).call();
  document.getElementById('accountSnowBalance').innerHTML ="Snowcoin balance: " + WalletBalance;
  }
}

//Gets the current active account wallet total number of NFTS and displays it below the header
async function GetWalletBalancePinguNFTS() {
  await GetAccounts();
  if(account === undefined){
    document.getElementById('accountPingusBalance').innerHTML ="Total NFTS: 0 ";
  }else {
  const WalletBalance = await Pingucontract.methods.Balance(account).call();
  document.getElementById('accountPingusBalance').innerHTML = "Total NFTS: " + WalletBalance;
  }
}

//Send snow to another wallet address from current active account
async function TransferSnow(){
  await GetAccounts();
  const addressReciever = document.getElementById('AddressReciever').value;
  const SnowAmountSend = document.getElementById('SnowAmountSend').value;
  if(account === undefined){
    return alert("connect account first");
  }
  const balance = await Snowcontract.methods.getBalance(account).call();
  if(Number(SnowAmountSend) > Number(balance)){
     alert("Not enough snow balance");
  }else if(web3.utils.isAddress(addressReciever) === false){
      alert("This is not a valid address");
   }else if(0 >= SnowAmountSend){
    alert("Cannot send less then 1");
   }else{
    await Snowcontract.methods.transfersnow(addressReciever, SnowAmountSend).send({ from: account });
    GetWalletBalanceSnow();
    GetWalletBalanceETH();
  }
}

//Enables or disabled the minting of Pingu NFTS only the owner of the contract can call this function inside of the contract
async function EnableMint() {
  await GetAccounts();
  await Pingucontract.methods.toggleIsMintEnabled().send({ from: account });
  GetWalletBalanceETH();
}

//Approve Pingu contract to spend snow balance total amount it can spend is the maxsupply of the Snow token inside the contract
async function ApproveSpender() {
  await GetAccounts();
  await Snowcontract.methods.ApproveAll(pinguAddress).send({ from: account });
  GetWalletBalanceETH();
  document.getElementById('btn-ApproveSpender').style.display = "none";
  document.getElementById('btn-MintNFT').style.display = "inline";
  document.getElementById('myNumberPingu').style.display = "inline";
}

//Mints a pingu NFT
async function CallNFTMintFunction() {
  await GetAccounts();
  if(await Pingucontract.methods.isMintEnabled().call() == false){
    return alert("Minting is not enabled wait for the owner of contract to enable minting");
  }
  let amount = document.getElementById('myNumberPingu').value;
  if(await Snowcontract.methods.getBalance(account).call() < amount * 1000){
    alert("Not enough snow balance try minting some snow first");
  }else if(amount > 0){
  await Pingucontract.methods.mint(amount).send({ from: account });
  GetWalletBalanceSnow();
  GetWalletBalanceETH();
  GetWalletBalancePinguNFTS();
  initPingus();
  }else{
    alert("wrong value can't be 0 or negative");
  }
}

//Mints snow Token
async function CallSnowMintFunction() {
  await GetAccounts();
  let amount = document.getElementById('myNumberSnow').value;
  if(account === undefined){
    alert("connect account first");
  }else if(amount > 0){
  const Payment = 1000000000000000000 * amount;
  await Snowcontract.methods.mintsnow(amount).send({ from: account, value: Payment });
  GetWalletBalanceSnow();
  GetWalletBalanceETH();
  }else{
    alert("wrong value can't be 0 or negative");
  }
}

//Withdraw all balance of Pingu contract
async function WithdrawSnowContractBalance() {
  await GetAccounts();
  await Snowcontract.methods.withdraw().send({from:account, gas:3000000});
  GetWalletBalanceETH();
}

//Withdraw all balance of Pingu contract
async function WithdrawPinguContractBalance() {
  await GetAccounts();
  await Pingucontract.methods.withdrawSnow().send({from:account});
  await GetWalletBalanceETH();
  await GetWalletBalanceSnow();
}



//Adds functions to buttons click on page load
document.getElementById('btn-connectwallet').addEventListener('click', WalletConnect);
document.getElementById('btn-MintNFT').addEventListener('click', CallNFTMintFunction);
document.getElementById('btn-Mintsnow').addEventListener('click', CallSnowMintFunction);
document.getElementById('btn-enableMintNFT').addEventListener('click', EnableMint);
document.getElementById('btn-ApproveSpender').addEventListener('click', ApproveSpender);
document.getElementById('btn-SendSnow').addEventListener('click', TransferSnow);
document.getElementById('btn-WithdrawPinguBalance').addEventListener('click', WithdrawPinguContractBalance);
document.getElementById('btn-WithdrawSnowBalance').addEventListener('click', WithdrawSnowContractBalance);


//calls these functions on page load -Connect wallet -Load Pingu NFTS
WalletConnect();
Check();
initPingus();
